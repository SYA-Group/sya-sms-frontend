import { useEffect, useState } from "react";
import { addUploadedContact, getUploadedContacts, uploadContacts } from "../api";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Search, RefreshCcw, ArrowUpDown, Plus, FileDown } from "lucide-react";
import toast from "react-hot-toast";

interface UploadRow {
  phone: string;
  name: string | null;
  status: string;
}

interface UploadReport {
  message: string;
  inserted: number;
  skipped: number;
  total: number;
  total_in_db?: number | null;
  rows: UploadRow[];
}

const PAGE_SIZE = 10;

const UploadContact = () => {
  const { darkMode } = useTheme();

  const emptyReport: UploadReport = {
    message: "",
    inserted: 0,
    skipped: 0,
    total: 0,
    total_in_db: 0,
    rows: [],
  };

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // New: Add Contact Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const [report, setReport] = useState<UploadReport>(emptyReport);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"phone" | "status">("phone");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);
    setMessage("");

    try {
      const res = await uploadContacts(file);

      setMessage(res.message || "Contacts uploaded successfully!");

      setReport({
        message: res.message,
        inserted: res.inserted,
        skipped: res.skipped,
        total: res.total,
        total_in_db: res.total_in_db,
        rows: res.rows || [],
      });
    } catch {
      setMessage("Failed to upload contacts.");
      setReport(emptyReport);
    } finally {
      setLoading(false);
    }
  };

  const refreshUploaded = async () => {
    try {
      const res = await getUploadedContacts();
      setReport((prev) => ({
        ...prev,
        total_in_db: res.total_in_db ?? 0,
        rows: res.rows || [],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshUploaded();
  }, []);

  // FILTER & SORT
  const filtered = report.rows
    .filter(
      (row) =>
        row.phone.includes(search) ||
        row.status.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortOrder === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: "phone" | "status") => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // EXPORT CSV
  const handleExportCSV = () => {
    if (report.rows.length === 0)
      return toast.error("No uploaded contacts to export.");

    const headers = ["Phone", "Name", "Status"];
    const rows = report.rows.map((r) => [
      `"${r.phone}"`,
      `"${r.name ?? ""}"`,
      `"${r.status}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "uploaded_contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ADD CONTACT MANUALLY
  const handleAddContact = async () => {
    const { name, phone } = newContact;
    const errs: { name?: string; phone?: string } = {};
  
    if (!phone.trim()) errs.phone = "Phone required";
  
    let normalized = phone.trim();
    if (normalized.startsWith("+")) normalized = normalized.slice(1);
    if (normalized.startsWith("0")) normalized = "20" + normalized.slice(1);
  
    const pattern = /^20\d{10}$/;
    if (!pattern.test(normalized)) errs.phone = "Invalid Egyptian number";
  
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
  
    setErrors({});
  
    try {
      // ⭐ REAL BACKEND CALL
      const res = await addUploadedContact({
        name: name.trim(),
        phone: normalized,
      });
  
      toast.success(res.message || "Contact added!");
  
      // ⭐ Immediately insert into table (no refresh needed)
      setReport((prev) => ({
        ...prev,
        rows: [
          {
            phone: normalized,
            name: name.trim(),
            status: "inserted",
          },
          ...prev.rows,
        ],
        inserted: prev.inserted + 1,
        total_in_db: (prev.total_in_db ?? 0) + 1,
      }));
  
      setShowAddModal(false);
      setNewContact({ name: "", phone: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to add contact.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 bg-gray-50 dark:bg-gray-900">

      {/* Upload Card */}
      <motion.div
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-lg mb-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          Upload Contacts
        </h1>

        <input
          type="file"
          accept=".csv,.xlsx"
          className="w-full mb-4 border rounded-md p-2 dark:bg-gray-700"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={() => setShowFormatModal(true)}
          className="text-blue-600 dark:text-blue-400 underline text-sm mb-4"
        >
          View required file format
        </button>

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-2 rounded-md font-semibold ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && (
          <p className="text-center mt-4 text-sm">{message}</p>
        )}
      </motion.div>

      {/* Summary Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="p-5 rounded-2xl bg-blue-600 text-white shadow">
          <div className="text-sm opacity-80">Total in file</div>
          <div className="text-2xl font-bold">{report.total}</div>
        </div>

        <div className="p-5 rounded-2xl bg-green-600 text-white shadow">
          <div className="text-sm opacity-80">Inserted</div>
          <div className="text-2xl font-bold">{report.inserted}</div>
        </div>

        <div className="p-5 rounded-2xl bg-yellow-500 text-white shadow">
          <div className="text-sm opacity-80">Duplicates</div>
          <div className="text-2xl font-bold">{report.skipped}</div>
        </div>

        <div className="p-5 rounded-2xl bg-purple-600 text-white shadow">
          <div className="text-sm opacity-80">Total in DB</div>
          <div className="text-2xl font-bold">{report.total_in_db}</div>
        </div>
      </div>

      {/* Upload Table Controls */}
      <div className="w-full max-w-5xl flex flex-wrap justify-between mb-6 gap-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />
          <input
            placeholder="Search phone or status..."
            className="pl-10 pr-4 py-2 rounded-xl border dark:bg-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
          >
            <Plus size={18} /> Add Contact
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl"
          >
            <FileDown size={18} /> Export
          </button>

          <button
            onClick={refreshUploaded}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* TABLE */}
      <motion.div
        className={`rounded-2xl shadow-lg overflow-hidden border ${
          darkMode ? "bg-slate-800" : "bg-white"
        } w-full max-w-5xl`}
      >
        <table className="w-full text-base">
          <thead className={`${darkMode ? "bg-slate-900" : "bg-gray-100"}`}>
            <tr>
              <th
                onClick={() => toggleSort("phone")}
                className="px-6 py-4 font-semibold cursor-pointer"
              >
                Phone <ArrowUpDown size={14} className="inline ml-1" />
              </th>
              <th
                onClick={() => toggleSort("status")}
                className="px-6 py-4 font-semibold cursor-pointer"
              >
                Status <ArrowUpDown size={14} className="inline ml-1" />
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.map((row, i) => (
              <tr
                key={i}
                className={`transition ${
                  darkMode ? "hover:bg-slate-700/50" : "hover:bg-gray-100"
                }`}
              >
                <td className="px-6 py-3 font-mono">{row.phone}</td>

                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.status === "inserted"
                        ? "bg-green-200 text-green-800"
                        : row.status === "duplicate"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center gap-4 py-5">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:bg-gray-500"
          >
            ← Previous
          </button>
          <span className="py-2">
            Page {page} of {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:bg-gray-500"
          >
            Next →
          </button>
        </div>
      </motion.div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-2xl w-[90%] max-w-md border shadow-xl ${
              darkMode ? "bg-slate-900 border-slate-700" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Add Contact
            </h2>

            <input
              className="w-full mb-3 p-3 rounded-lg border dark:bg-slate-800"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) =>
                setNewContact((p) => ({ ...p, name: e.target.value }))
              }
            />
            {errors.name && (
              <p className="text-red-500 text-sm mb-2">{errors.name}</p>
            )}

            <input
              className="w-full mb-3 p-3 rounded-lg border dark:bg-slate-800"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) =>
                setNewContact((p) => ({ ...p, phone: e.target.value }))
              }
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mb-2">{errors.phone}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleAddContact}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Format Modal */}
      {showFormatModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[90%] max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-3">Required File Format</h2>

            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm font-mono">
              phone,name<br />
              201012345678,Ahmed<br />
              201198765432,Mohamed
            </div>

            <button
              onClick={() => setShowFormatModal(false)}
              className="mt-4 w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UploadContact;

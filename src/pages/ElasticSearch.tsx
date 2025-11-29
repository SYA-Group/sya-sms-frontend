import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api, { getSmsProgress, searchCount, searchPreview, sendSearchSMS } from "../api";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { Search, Send, Loader2 } from "lucide-react";

const ElasticSearch = () => {
  const { darkMode } = useTheme();

  const [query, setQuery] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const [preview, setPreview] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [smsText, setSmsText] = useState("");
  const [limit, setLimit] = useState(100);

  const [sending, setSending] = useState(false);

  // Filters (demographic + occupation)
  const [governorate, setGovernorate] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone_key, setPhoneKey] = useState("");

  const [city, setCity] = useState(""); // fromCity
  const [address, setAddress] = useState(""); // livedIn
  const [religion, setReligion] = useState("");
  const [relation, setRelation] = useState("");

  const [work, setWork] = useState(""); // workAt
  const [studied, setStudied] = useState(""); // studiedAt
  const [job, setJob] = useState(""); // jop

  const [errors, setErrors] = useState<any>({});

  // Accordion states
  const [showDemographic, setShowDemographic] = useState(true);
  const [showOccupation, setShowOccupation] = useState(false);

  const [progress, setProgress] = useState<any>({
    status: "idle",
    sent: 0,
    failed: 0,
    total: 0,
  });
  

  useEffect(() => {
    const fetchLastMessage = async () => {
      try {
        const res = await api.get("/sms/last_message");
        if (res.data.message) {
          setSmsText(res.data.message);
        }
      } catch (err) {
        console.error("Failed to load last message for ElasticSearch:", err);
      }
    };

    fetchLastMessage();
  }, []);


  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await getSmsProgress();
        setProgress(res);
      } catch (err) {
        console.error("Progress fetch failed", err);
      }
    }, 1500);
  
    return () => clearInterval(timer);
  }, []);
  

  // ---------------------------------------------------------
  // 🔵 SINGLE COUNT EFFECT (debounced)
  // ---------------------------------------------------------
  useEffect(() => {
    const noFilters =
      !query &&
      !governorate &&
      !gender &&
      !birthdate &&
      !phone_key &&
      !city &&
      !address &&
      !religion &&
      !relation &&
      !work &&
      !studied &&
      !job;

    // If all empty → reset
    if (noFilters) {
      setCount(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoadingCount(true);
        const res = await searchCount(
          query || "",
          governorate || undefined,
          gender || undefined,
          birthdate || undefined,
          phone_key || undefined,
          city || undefined,
          address || undefined,
          work || undefined,
          studied || undefined,
          religion || undefined,
          relation || undefined,
          job || undefined
        );
        setCount(res.count);
      } catch (err) {
        setCount(null);
      } finally {
        setLoadingCount(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [
    query,
    governorate,
    gender,
    birthdate,
    phone_key,
    city,
    address,
    religion,
    relation,
    work,
    studied,
    job,
  ]);

  // ---------------------------------------------------------
  // 🔵 LOAD PREVIEW (WORKS WITH FILTERS ONLY)
  // ---------------------------------------------------------
  const loadPreview = async () => {
    const noFilters =
      !query &&
      !governorate &&
      !gender &&
      !birthdate &&
      !phone_key &&
      !city &&
      !address &&
      !religion &&
      !relation &&
      !work &&
      !studied &&
      !job;

    if (noFilters) {
      setErrors({ query: "Type something or select a filter first." });
      return;
    }

    setErrors({});
    setLoadingPreview(true);

    try {
      const res = await searchPreview(
        query || "",
        20,
        governorate || undefined,
        gender || undefined,
        birthdate || undefined,
        phone_key || undefined,
        city || undefined,
        address || undefined,
        work || undefined,
        studied || undefined,
        religion || undefined,
        relation || undefined,
        job || undefined
      );

      setPreview(res.results || []);
    } catch (err) {
      setErrors({
        query: "Failed to load preview.",
      });
    }

    setLoadingPreview(false);
  };

  const formatGender = (g?: string | null) => {
    if (!g) return "-";
    if (g === "male") return "Male";
    if (g === "female") return "Female";
    return g;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "-";
    if (phone.length <= 2) return "**";
    return phone.slice(0, phone.length - 2) + "**";
  };

  // ---------------------------------------------------------
  // 🧱 DYNAMIC COLUMNS (based on active filters)
  // ---------------------------------------------------------
  const dynamicColumns = [
    // DEMOGRAPHIC
    {
      key: "governorate",
      label: "Governorate",
      active: !!governorate,
      getValue: (_item: any) => governorate || "-",
    },
    {
      key: "city",
      label: "City",
      active: !!city,
      getValue: (item: any) => item.fromCity || "-",
    },
    {
      key: "address",
      label: "Address / Area",
      active: !!address,
      getValue: (item: any) => item.livedIn || "-",
    },
    {
      key: "gender",
      label: "Gender",
      active: !!gender,
      getValue: (item: any) => formatGender(item.gender),
    },
    {
      key: "birthdate",
      label: "Birthdate",
      active: !!birthdate,
      getValue: (item: any) => item.birthDate || "-",
    },
    {
      key: "religion",
      label: "Religion",
      active: !!religion,
      getValue: (item: any) => item.religion || "-",
    },
    {
      key: "relation",
      label: "Relation",
      active: !!relation,
      getValue: (item: any) => item.relation || "-",
    },

    // OCCUPATION
    {
      key: "job",
      label: "Job / Profession",
      active: !!job,
      getValue: (item: any) => item.jop || "-",
    },
    {
      key: "work",
      label: "Workplace",
      active: !!work,
      getValue: (item: any) => item.workAt || "-",
    },
    {
      key: "studied",
      label: "Studied At",
      active: !!studied,
      getValue: (item: any) => item.studiedAt || "-",
    },
  ];

  const activeColumns = dynamicColumns.filter((col) => col.active);

  // ---------------------------------------------------------
  // 🔴 SEND SMS
  // ---------------------------------------------------------
  const handleSend = async () => {
    const noFilters =
      !query &&
      !governorate &&
      !gender &&
      !birthdate &&
      !phone_key &&
      !city &&
      !address &&
      !religion &&
      !relation &&
      !work &&
      !studied &&
      !job;

    if (noFilters) {
      toast.error("Search or filter first.");
      setErrors({ query: "You must type search or choose a filter." });
      return;
    }

    const newErrors: any = {};

    if (!smsText) newErrors.smsText = "SMS text is required.";
    if (limit <= 0) newErrors.limit = "Limit must be greater than 0.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSending(true);
    setErrors({});

    try {
      const res = await sendSearchSMS({
        query,
        sms_text: smsText,
        limit,
        save_to_customers: true,
        governorate: governorate || undefined,
        gender: gender || undefined,
        birthdate: birthdate || undefined,
        phone_key: phone_key || undefined,
        city: city || undefined,
        address: address || undefined,
        work: work || undefined,
        studied: studied || undefined,
        religion: religion || undefined,
        relation: relation || undefined,
        job: job || undefined,
      });

      toast.success(`Sending started… Total numbers: ${res.total}`);

    } catch (err: any) {
      const backendError = err?.response?.data?.error || "Failed to send";

      if (backendError.includes("search")) {
        setErrors({ query: backendError });
      } else if (backendError.includes("Limit")) {
        setErrors({ limit: backendError });
      } else if (backendError.includes("SMS")) {
        setErrors({ smsText: backendError });
      } else {
        toast.error(backendError);
      }
    }

    setSending(false);
  };

  const getSmsUnits = (text: string) => {
    const length = text.length;

    if (length === 0) return 0;
    if (length <= 70) return 1;

    // Multiparts: 67 chars each after first
    return Math.ceil((length - 70) / 67) + 1;
  };

  return (
    <div
      className={`min-h-screen px-6 sm:px-10 py-8 transition-all ${
        darkMode ? "bg-[#0f172a] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-10 text-center"
      >
        Search Customers
      </motion.h1>

      {/* Filter Groups ABOVE the search bar */}
      <div className="space-y-4 mb-6">
        {/* Demographic Filters */}
        <div
          className={`rounded-xl border ${
            darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-gray-200 bg-white"
          } shadow-sm`}
        >
          <button
            type="button"
            onClick={() => setShowDemographic((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="font-semibold text-sm">Demographic Filters</span>
            <span className="text-xs opacity-70">
              {showDemographic ? "Hide" : "Show"}
            </span>
          </button>

          {showDemographic && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Governorate */}
              <div>
                <label className="text-sm opacity-70">Governorate</label>
                <input
                  type="text"
                  placeholder="Type governorate..."
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              {/* City (fromCity) */}
              <div>
                <label className="text-sm opacity-70">City</label>
                <input
                  type="text"
                  placeholder="Type city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              {/* Address (livedIn) */}
              <div>
                <label className="text-sm opacity-70">Address / Area</label>
                <input
                  type="text"
                  placeholder="Type address or area..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm opacity-70">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white"
                      : "bg-gray-100 border-gray-400 text-gray-900"
                  }`}
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Birthdate */}
              <div>
                <label className="text-sm opacity-70">Birthdate</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              {/* Religion */}
              <div>
                <label className="text-sm opacity-70">Religion</label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white"
                      : "bg-gray-100 border-gray-400 text-gray-900"
                  }`}
                >
                  <option value="">All</option>
                  {/* adjust values based on your data */}
                  <option value="مسلم">مسلم</option>
                  <option value="مسيحي">مسيحي</option>
                </select>
              </div>

              {/* Relation */}
              <div>
                <label className="text-sm opacity-70">Relation</label>
                <input
                  type="text"
                  placeholder="e.g. single, married..."
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              {/* Carrier (NOT used as table column) */}
              <div>
                <label className="text-sm opacity-70">Phone Carrier</label>
                <select
                  value={phone_key}
                  onChange={(e) => setPhoneKey(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white"
                      : "bg-gray-100 border-gray-400 text-gray-900"
                  }`}
                >
                  <option value="">All Carriers</option>
                  <option value="vodafone">Vodafone</option>
                  <option value="etisalat">Etisalat</option>
                  <option value="orange">Orange</option>
                  <option value="we">WE</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Occupation Filters */}
        <div
          className={`rounded-xl border ${
            darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-gray-200 bg-white"
          } shadow-sm`}
        >
          <button
            type="button"
            onClick={() => setShowOccupation((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="font-semibold text-sm">Occupation Filters</span>
            <span className="text-xs opacity-70">
              {showOccupation ? "Hide" : "Show"}
            </span>
          </button>

          {showOccupation && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Job / Profession (jop) */}
              <div>
                <label className="text-sm opacity-70">Job / Profession</label>
                <input
                  type="text"
                  placeholder="e.g. mechanic, engineer..."
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              {/* Workplace (workAt) */}
              <div>
                <label className="text-sm opacity-70">Workplace</label>
                <input
                  type="text"
                  placeholder="e.g. TE Data, Car dealer..."
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              {/* Studied At (studiedAt) */}
              <div>
                <label className="text-sm opacity-70">Studied At</label>
                <input
                  type="text"
                  placeholder="e.g. Cairo University..."
                  value={studied}
                  onChange={(e) => setStudied(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      : "bg-gray-100 border-gray-400 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar (unchanged position) */}
      <div
        className={`rounded-xl shadow-md p-5 mb-8 border ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Search className="text-blue-500" />

          <input
            type="text"
            placeholder="Type anything to search (job/city/work/address)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (errors.query) setErrors((prev: any) => ({ ...prev, query: null }));
            }}
            className={`flex-1 px-4 py-3 rounded-lg outline-none text-base ${
              darkMode
                ? "bg-slate-900 border border-slate-700"
                : "bg-gray-100 border border-gray-300"
            }`}
          />

          {loadingCount && <Loader2 className="animate-spin text-blue-500" />}
        </div>

        {errors.query && (
          <p className="text-red-500 text-sm mt-1">{errors.query}</p>
        )}

        {count !== null && (
          <p className="mt-3 text-sm opacity-80">
            Found <span className="font-semibold">{count}</span> matching records
          </p>
        )}

        <button
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          onClick={loadPreview}
        >
          Load Preview (20)
        </button>
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl shadow-lg p-5 mb-10 border ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {loadingPreview ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : preview.length === 0 ? (
          <p>No preview available yet.</p>
        ) : (
          <div className="overflow-auto">
            <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-slate-700 shadow-md">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-2xl shadow-lg overflow-hidden border mb-10 ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* Header */}
                <div
                  className={`p-5 border-b ${
                    darkMode
                      ? "border-slate-700 text-gray-100"
                      : "border-gray-200 text-gray-800"
                  }`}
                >
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Preview Results (Top 20)
                  </h2>
                </div>

                {/* Table */}
                <div
                  className={`overflow-x-auto scrollbar-thin ${
                    darkMode
                      ? "scrollbar-thumb-slate-600"
                      : "scrollbar-thumb-gray-400"
                  }`}
                >
                  <table
                    className={`w-full text-sm sm:text-base ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    <thead
                      className={`sticky top-0 z-10 ${
                        darkMode ? "bg-slate-900" : "bg-gray-100"
                      }`}
                    >
                      <tr>
                        {/* Fixed Phone column */}
                        <th className="text-left px-6 py-4 font-semibold">
                          Phone
                        </th>

                        {/* Dynamic columns based on active filters */}
                        {activeColumns.map((col) => (
                          <th
                            key={col.key}
                            className="text-left px-6 py-4 font-semibold"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody
                      className={`divide-y ${
                        darkMode ? "divide-slate-700" : "divide-gray-200"
                      }`}
                    >
                      {preview.map((item, i) => (
                        <tr
                          key={i}
                          className={`transition-colors hover:bg-blue-50 dark:hover:bg-slate-700`}
                        >
                          {/* Phone */}
                          <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                            {maskPhone(item.phone)}
                          </td>

                          {/* Dynamic values */}
                          {activeColumns.map((col) => (
                            <td key={col.key} className="px-6 py-4">
                              {col.getValue(item)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Send SMS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl shadow-lg p-5 border ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">
          Send SMS to Search Results
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm opacity-70">How many to send?</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className={`w-full mt-1 px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-slate-900 border-slate-600"
                  : "bg-gray-100 border-gray-300"
              }`}
            />
            {errors.limit && (
              <p className="text-red-500 text-sm mt-1">{errors.limit}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm opacity-70">SMS Text</label>
            <textarea
              value={smsText}
              onChange={(e) => {
                setSmsText(e.target.value);
                if (errors.smsText) {
                  setErrors((prev: any) => ({ ...prev, smsText: null }));
                }
              }}
              className={`w-full mt-1 px-4 py-2 rounded-lg h-24 resize-none ${
                darkMode
                  ? "bg-slate-900 border-slate-600"
                  : "bg-gray-100 border-gray-300"
              }`}
            />

            {/* Character Count + SMS Units */}
            <div className="flex items-center justify-between mt-1 text-sm opacity-70">
              <p>{smsText.length} characters</p>
              <p>{getSmsUnits(smsText)} SMS unit(s)</p>
            </div>

            {errors.smsText && (
              <p className="text-red-500 text-sm mt-1">{errors.smsText}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 font-semibold shadow"
        >
          {sending ? (
            <>
              <Loader2 className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={18} />
              Send SMS
            </>
          )}
        </button>
        {/* Sending Progress */}
{progress.status !== "idle" && (
  <div className="mt-5 p-4 rounded-lg border border-blue-500 bg-blue-50 dark:bg-slate-900 dark:border-slate-700 shadow">
    {/* Title */}
    {progress.status === "sending" && (
      <p className="font-semibold mb-2">
        Sending... {progress.sent} / {progress.total}
      </p>
    )}

    {progress.status === "done" && (
      <p className="font-semibold mb-2 text-green-600 dark:text-green-400">
        Completed: {progress.sent} sent, {progress.failed} failed
      </p>
    )}

    {/* Progress Bar */}
    {progress.status === "sending" && (
      <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 h-3 transition-all"
          style={{
            width:
              progress.total > 0
                ? `${Math.min(
                    100,
                    Math.round((progress.sent / progress.total) * 100)
                  )}%`
                : "0%",
          }}
        />
      </div>
    )}
  </div>
)}

      </motion.div>
    </div>
  );
};

export default ElasticSearch;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { searchCount, searchPreview, sendSearchSMS } from "../api";
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

  // Filters
  const [governorate, setGovernorate] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone_key, setPhoneKey] = useState("");

  // ---------------------------------------------------------
  // 🔵 SINGLE COUNT EFFECT (debounced)
  // ---------------------------------------------------------
  useEffect(() => {
    // If all empty → reset
    if (!query && !governorate && !gender && !birthdate && !phone_key) {
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
          phone_key || undefined
        );
        setCount(res.count);
      } catch (err) {
        setCount(null);
      } finally {
        setLoadingCount(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [query, governorate, gender, birthdate, phone_key]);

  // ---------------------------------------------------------
  // 🔵 LOAD PREVIEW (WORKS WITH FILTERS ONLY)
  // ---------------------------------------------------------
  const loadPreview = async () => {
    if (!query && !governorate && !gender && !birthdate && !phone_key) {
      toast.error("Type something or select a filter first.");
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await searchPreview(
        query || "",
        20,
        governorate || undefined,
        gender || undefined,
        birthdate || undefined,
        phone_key || undefined
      );

      setPreview(res.results || []);
    } catch (err) {
      toast.error("Failed to load preview");
    }
    setLoadingPreview(false);
  };



  const buildGeneral = (item: any) => {
    const parts: string[] = [];
  
    if (query) parts.push(query);
    if (governorate) parts.push(governorate);
    if (gender) parts.push(gender);
    if (birthdate) parts.push(birthdate);
    if (phone_key) {
      const map: any = {
        vodafone: "Vodafone",
        etisalat: "Etisalat",
        orange: "Orange",
        we: "WE",
      };
      parts.push(map[phone_key] || phone_key);
    }
  
    // If the user typed nothing or selected nothing → fallback to actual job/work fields
    if (parts.length === 0) {
      if (item.jop) parts.push(item.jop);
      else if (item.workAt) parts.push(item.workAt);
      else parts.push("-");
    }
  
    return parts.join(" • ");
  };
  
  const maskPhone = (phone: string) => {
    if (!phone) return "-";
    if (phone.length <= 2) return "**";
  
    return phone.slice(0, phone.length - 2) + "**";
  };
  

  // ---------------------------------------------------------
  // 🔴 SEND SMS
  // ---------------------------------------------------------
  const handleSend = async () => {
    if (!query && !governorate && !gender && !birthdate && !phone_key) {
      toast.error("Search or filter first.");
      return;
    }

    if (!smsText || limit <= 0) {
      toast.error("Please fill SMS text and limit.");
      return;
    }

    setSending(true);

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
      });

      toast.success(`Sent: ${res.sent}, Failed: ${res.failed}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send");
    }

    setSending(false);
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

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">

        {/* Governorate */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm opacity-70">Governorate</label>
          <input
            type="text"
            placeholder="Type city or governorate..."
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className={`w-full mt-1 px-3 py-2 rounded-lg ${
              darkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-gray-100 border-gray-300"
            }`}
          />
        </div>

        {/* Gender */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm opacity-70">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`w-full mt-1 px-3 py-2 rounded-lg ${
              darkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Birthdate */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm opacity-70">Birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className={`w-full mt-1 px-3 py-2 rounded-lg ${
              darkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-gray-100 border-gray-300"
            }`}
          />
        </div>

        {/* Carrier */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm opacity-70">Phone Carrier</label>
          <select
            value={phone_key}
            onChange={(e) => setPhoneKey(e.target.value)}
            className={`w-full mt-1 px-3 py-2 rounded-lg ${
              darkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <option value="">All Carriers</option>
            <option value="vodafone">Vodafone </option>
            <option value="etisalat">Etisalat </option>
            <option value="orange">Orange </option>
            <option value="we">WE </option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={`rounded-xl shadow-md p-5 mb-8 border ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Search className="text-blue-500" />

          <input
            type="text"
            placeholder="Type anything to search ElasticSearch..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-lg outline-none text-base ${
              darkMode
                ? "bg-slate-900 border border-slate-700"
                : "bg-gray-100 border border-gray-300"
            }`}
          />

          {loadingCount && <Loader2 className="animate-spin text-blue-500" />}
        </div>

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
        <h2 className="text-xl font-semibold mb-4">Preview Results (Top 20)</h2>

        {loadingPreview ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : preview.length === 0 ? (
          <p>No preview available yet.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-slate-700">
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">General</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item, i) => (
                  <tr key={i} className="border-b dark:border-slate-800">
                    <td className="p-2">{maskPhone(item.phone)}</td>
                    <td className="p-2">{buildGeneral(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <h2 className="text-xl font-semibold mb-4">Send SMS to Search Results</h2>

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
          </div>

          <div className="md:col-span-2">
            <label className="text-sm opacity-70">SMS Text</label>
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              className={`w-full mt-1 px-4 py-2 rounded-lg h-24 resize-none ${
                darkMode
                  ? "bg-slate-900 border-slate-600"
                  : "bg-gray-100 border-gray-300"
              }`}
            ></textarea>
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
      </motion.div>
    </div>
  );
};

export default ElasticSearch;

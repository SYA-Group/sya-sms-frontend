import { useState } from "react";
import { uploadContacts } from "../api";
import { motion } from "framer-motion";

const UploadContact = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

 const handleUpload = async () => {
  if (!file) return alert("Please select a file first!");
  setLoading(true);
  try {
    const res = await uploadContacts(file); // ✅ send file, not formData
    setMessage(res.message || "Contacts uploaded successfully!");
  } catch (err) {
    console.error(err);
    setMessage("Failed to upload contacts.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <motion.div
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          Upload Contacts
        </h1>

        <input
          type="file"
          accept=".csv,.xlsx"
          className="w-full mb-4 border border-gray-300 dark:border-gray-700 p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-2 rounded-md font-semibold ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white transition"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default UploadContact;

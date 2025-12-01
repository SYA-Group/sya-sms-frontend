import { useState } from "react";
import { uploadContacts } from "../api";
import { motion } from "framer-motion";

const UploadContact = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);


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
          onClick={() => setShowFormatModal(true)}
          className="text-blue-600 dark:text-blue-400 underline text-sm ml-2"
        >
          View required file format
        </button>


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
      {showFormatModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[90%] max-w-md"
    >
      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Required File Format
      </h2>

      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
        Your file must contain the following columns:
      </p>

      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm font-mono mb-4">
        phone,name<br />
        201012345678,Ahmed<br />
        201198765432,Mohamed
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400">
        • Only <b>.csv</b> and <b>.xlsx</b> files are supported.<br />
        • <b>phone</b> column is required.<br />
        • <b>name</b> is optional.<br />
        • Numbers are auto-normalized to Egyptian format.
      </p>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowFormatModal(false)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </motion.div>
  </div>
)}

    </div>
    
  );
};

export default UploadContact;

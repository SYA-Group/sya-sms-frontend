import { useState, useEffect, useRef } from "react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const POLL_INTERVAL = 2000;

const SendPanel = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const pollRef = useRef<number | null>(null);
  const [errors, setErrors] = useState<any>({});


  /** ------------------------------
   *  Helper: Fetch SMS progress
   *  ------------------------------ */
  const pollProgress = async () => {
    try {
      const res = await api.get("/sms/progress");
      setSentCount(res.data.sent ?? 0);
      setFailedCount(res.data.failed ?? 0);
    } catch (err) {
      console.error("Failed to fetch SMS progress:", err);
    }
  };

  /** ------------------------------
   *  Start polling progress
   *  ------------------------------ */
  const startPollingProgress = () => {
    pollProgress();
    stopPollingProgress(); // clear before start
    pollRef.current = window.setInterval(pollProgress, POLL_INTERVAL);
  };

  /** ------------------------------
   *  Stop polling progress
   *  ------------------------------ */
  const stopPollingProgress = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  /** ------------------------------
   *  Handle Start Sending
   *  ------------------------------ */
  const handleStart = async () => {
    if (!message.trim()) {
      alert("Enter a message first!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/sms/send", { message: message.trim() });
      if (res.data.message === "SMS sending started") {
        setIsActive(true);
        setStatusType("success");
        setStatus("SMS sending started...");
        startPollingProgress();
      } else {
        setStatusType("error");
        setStatus("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatus("Failed to start SMS sending.");
    } finally {
      setLoading(false);
    }
  };

  /** ------------------------------
   *  Handle Stop Sending
   *  ------------------------------ */
  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await api.post("/sms/stop");
      if (res.data.message === "SMS sending stopped") {
        setIsActive(false);
        setStatusType("info");
        setStatus("SMS sending stopped.");
      } else {
        setStatusType("error");
        setStatus("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatus("Failed to stop SMS sending.");
    } finally {
      setLoading(false);
      stopPollingProgress();
      setSentCount(0);
      setFailedCount(0);
    }
  };

  const getSmsUnits = (text: string) => {
    const length = text.length;
  
    if (length === 0) return 0;
    if (length <= 70) return 1;
  
    return Math.ceil((length - 70) / 67) + 1;
  };
  

  /** ------------------------------
   *  Load last message on mount
   *  ------------------------------ */
  useEffect(() => {
    const fetchLastMessage = async () => {
      try {
        const res = await api.get("/sms/last_message");
        if (res.data.message) {
          setMessage(res.data.message);
        }
      } catch (err) {
        console.error("Failed to load last message:", err);
      }
    };
    fetchLastMessage();
  }, []);

  /** ------------------------------
   *  Cleanup on unmount
   *  ------------------------------ */
  useEffect(() => {
    return () => stopPollingProgress();
  }, []);


  
  /** ------------------------------
   *  Derived values
   *  ------------------------------ */
  const total = sentCount + failedCount;
  const sentPercent = total ? (sentCount / total) * 100 : 0;
  const failedPercent = total ? (failedCount / total) * 100 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800 dark:text-white">
          Send SMS
        </h1>

        <textarea
  className="w-full h-32 p-4 mb-1 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none resize-none shadow-sm"
  placeholder="Type your message here..."
  value={message}
  onChange={(e) => {
    const val = e.target.value;
    setMessage(val);

    // Clear error when typing
    if (errors.smsText) {
      setErrors((prev: any) => ({ ...prev, smsText: null }));
    }
  }}
  disabled={isActive}
/>

{/* Character count + units */}
<div className="flex justify-between text-sm opacity-70 px-1 mb-1">
  <span>{message.length} characters</span>
  <span>{getSmsUnits(message)} SMS unit(s)</span>
</div>

{/* Error message like ElasticSearch */}
{errors.smsText && (
  <p className="text-red-500 text-sm mb-2 px-1">{errors.smsText}</p>
)}


        <div className="flex gap-4 mt-2">
          <button
            onClick={handleStart}
            disabled={isActive || loading}
            className={`flex-1 py-3 rounded-xl font-semibold shadow-md flex justify-center items-center gap-2 transition ${
              isActive || loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading && !isActive ? "Starting..." : "Start Sending"}
          </button>

          <button
            onClick={handleStop}
            disabled={!isActive || loading}
            className={`flex-1 py-3 rounded-xl font-semibold shadow-md flex justify-center items-center gap-2 transition ${
              !isActive || loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {loading && isActive ? "Stopping..." : "Stop Sending"}
          </button>
        </div>

        {/* Status feedback */}
        <AnimatePresence>
          {status && (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${
                statusType === "success"
                  ? "text-green-700 dark:text-green-400"
                  : statusType === "error"
                  ? "text-red-700 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {statusType === "success" && <CheckCircle size={18} />}
              {statusType === "error" && <XCircle size={18} />}
              <span>{status}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {isActive && total > 0 && (
          <div className="mt-6">
            <div className="flex justify-between mb-1 text-sm text-gray-700 dark:text-gray-300">
              <span>Sent: {sentCount}</span>
              <span>Failed: {failedCount}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex overflow-hidden">
              <motion.div
                className="h-4 bg-green-500 dark:bg-green-400"
                style={{ width: `${sentPercent}%` }}
                animate={{ width: `${sentPercent}%` }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="h-4 bg-red-600 dark:bg-red-700"
                style={{ width: `${failedPercent}%` }}
                animate={{ width: `${failedPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SendPanel;

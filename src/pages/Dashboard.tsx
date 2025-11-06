import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { getDashboardStats } from "../api";
import StatsCard from "../components/StatsCard";
import ExpandableRow from "../components/ExpandableRow"; // ✅ Added import
import "../index.css";
import "modern-normalize/modern-normalize.css";

interface DashboardStats {
  summary: {
    contacts_total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  recent_messages: {
    phone: string;
    message: string;
    status: string;
    retries: number;
    created_at: string;
  }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadStats = async () => {
    try {
      setError(null);
      const data = await getDashboardStats();

      if (
        !data ||
        typeof data !== "object" ||
        !data.summary ||
        !Array.isArray(data.recent_messages)
      ) {
        throw new Error("Invalid or empty data");
      }

      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("⚠️ Server is offline. Displaying empty dashboard.");
      setStats({
        summary: { contacts_total: 0, sent: 0, failed: 0, pending: 0 },
        recent_messages: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isFetchingMore) {
        setIsFetchingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + 20);
          setIsFetchingMore(false);
        }, 600);
      }
    },
    [isFetchingMore]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "100px", threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg sm:text-xl font-medium text-gray-500 dark:text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  const { summary, recent_messages } = stats || {
    summary: { contacts_total: 0, sent: 0, failed: 0, pending: 0 },
    recent_messages: [],
  };

  const visibleMessages = recent_messages.slice(0, visibleCount);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <motion.h1
        className="text-2xl sm:text-3xl font-bold mb-8 text-center sm:text-left text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Dashboard Overview
      </motion.h1>

      {/* === Summary Cards === */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <StatsCard
          title="Total Contacts"
          value={summary.contacts_total}
          color="bg-blue-500"
          icon="users"
        />
        <StatsCard
          title="Messages Sent"
          value={summary.sent}
          color="bg-green-500"
          icon="send"
        />
        <StatsCard
          title="Failed Messages"
          value={summary.failed}
          color="bg-red-500"
          icon="alert-triangle"
        />
        <StatsCard
          title="Pending Messages"
          value={summary.pending}
          color="bg-yellow-500"
          icon="clock"
        />
      </motion.div>

      {/* === Recent Messages Table === */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center sm:text-left">
            Recent Messages
          </h2>
        </div>

        {error && (
          <div className="p-4 text-yellow-600 dark:text-yellow-400 text-center text-sm">
            {error}
          </div>
        )}

        {visibleMessages.length === 0 ? (
          <div className="p-6 text-base sm:text-lg text-gray-500 text-center">
            No messages yet.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
            <table className="w-full text-sm sm:text-base text-gray-800 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                    Phone
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                    Message
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                    Status
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                    Retries
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {visibleMessages.map((msg, i) => (
                  <ExpandableRow key={i} msg={msg} index={i} /> // ✅ replaced motion.tr
                ))}
              </tbody>
            </table>

            <div
              ref={observerRef}
              className="h-16 flex justify-center items-center"
            >
              {isFetchingMore && (
                <div className="text-gray-500 dark:text-gray-300 animate-pulse text-sm sm:text-lg">
                  Loading more...
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

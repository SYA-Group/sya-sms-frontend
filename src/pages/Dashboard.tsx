import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { getDashboardStats } from "../api";
import StatsCard from "../components/StatsCard";
import ExpandableRow from "../components/ExpandableRow";
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

const PAGE_SIZE = 20;

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<
    DashboardStats["recent_messages"]
  >([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "sent" | "pending" | "failed"
  >("all");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ Enhanced: load with cache first
  const loadStats = async (forceRefresh = false) => {
    try {
      setError(null);

      // --- 1. Use cached data for instant render ---
      if (!forceRefresh) {
        const cached = sessionStorage.getItem("dashboard_cache");
        if (cached) {
          try {
            const cachedData: DashboardStats = JSON.parse(cached);
            setStats(cachedData);
            const filtered = cachedData.recent_messages.filter(
              (msg) =>
                filterStatus === "all" ||
                msg.status.toLowerCase() === filterStatus
            );
            setVisibleMessages(filtered.slice(0, PAGE_SIZE));
            setLoading(false);
          } catch {
            sessionStorage.removeItem("dashboard_cache");
          }
        }
      }

      // --- 2. Always refresh in background (so data stays fresh) ---
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
      sessionStorage.setItem("dashboard_cache", JSON.stringify(data));

      const filtered = data.recent_messages.filter(
        (msg: { status: string }) =>
          filterStatus === "all" || msg.status.toLowerCase() === filterStatus
      );
      setVisibleMessages(filtered.slice(0, PAGE_SIZE));
      setPage(1);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("⚠️ Server is offline. Displaying cached/empty dashboard.");

      // Try fallback from cache even if API fails
      const cached = sessionStorage.getItem("dashboard_cache");
      if (cached) {
        try {
          const cachedData: DashboardStats = JSON.parse(cached);
          setStats(cachedData);
          const filtered = cachedData.recent_messages.filter(
            (msg) =>
              filterStatus === "all" ||
              msg.status.toLowerCase() === filterStatus
          );
          setVisibleMessages(filtered.slice(0, PAGE_SIZE));
          return;
        } catch {
          sessionStorage.removeItem("dashboard_cache");
        }
      }

      // fallback empty
      setStats({
        summary: { contacts_total: 0, sent: 0, failed: 0, pending: 0 },
        recent_messages: [],
      });
      setVisibleMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ keep auto-refresh but skip full reload if cached data available
  useEffect(() => {
    loadStats();
    const interval = setInterval(() => loadStats(true), 10000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleScroll = () => {
    if (!stats) return;
    const container = scrollRef.current;
    if (!container || loadingMore) return;

    const filteredMessages = stats.recent_messages.filter(
      (msg) =>
        filterStatus === "all" || msg.status.toLowerCase() === filterStatus
    );

    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10
    ) {
      const nextPage = page + 1;
      const start = page * PAGE_SIZE;
      const nextMessages = filteredMessages.slice(start, start + PAGE_SIZE);

      if (nextMessages.length > 0) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleMessages((prev) => [...prev, ...nextMessages]);
          setPage(nextPage);
          setLoadingMore(false);
        }, 300);
      }
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen text-lg sm:text-xl font-medium text-gray-500 dark:text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  const { summary } = stats || {
    summary: { contacts_total: 0, sent: 0, failed: 0, pending: 0 },
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <motion.h1
        className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Dashboard Overview
      </motion.h1>

      {/* === Summary Cards with filter === */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8"
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
          onClick={() => setFilterStatus("sent")}
        />
        <StatsCard
          title="Failed Messages"
          value={summary.failed}
          color="bg-red-500"
          icon="alert-triangle"
          onClick={() => setFilterStatus("failed")}
        />
        <StatsCard
          title="Pending Messages"
          value={summary.pending}
          color="bg-yellow-500"
          icon="clock"
          onClick={() => setFilterStatus("pending")}
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
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700"
          >
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
                  <ExpandableRow key={i} msg={msg} index={i} />
                ))}
              </tbody>
            </table>
            {loadingMore && (
              <div className="h-16 flex justify-center items-center text-gray-500 dark:text-gray-300 animate-pulse text-sm sm:text-lg">
                Loading more...
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

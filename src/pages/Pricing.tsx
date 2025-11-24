import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import PricingCard from "../components/PricingCard";
import { getPricing } from "../api";

interface Plan {
  id: number;
  sms_amount: string;
  price: string;
  color: string;          // HEX string from backend, e.g. "#6366f1"
  senderIDs: string;
  apiIntegration: string;
  support: string;
}

const Pricing = () => {
  const { darkMode } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await getPricing();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load pricing", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        darkMode
          ? "bg-[#020617] text-gray-100"
          : "bg-gradient-to-b from-slate-50 via-white to-indigo-50 text-gray-900"
      }`}
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* Content container */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-10 sm:py-14 lg:py-16">
        {/* Top navigation strip (inside Layout's public header content area) */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-xs sm:text-sm text-indigo-700 dark:text-indigo-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Profile SMS marketing made for Egypt
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-4 text-sm"
          >
            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
              Already have an account?
            </span>
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              Login
            </Link>
          </motion.div>
        </div>

        {/* HERO SECTION */}
        <section className="grid gap-10 lg:grid-cols-[1.3fr_minmax(0,1fr)] items-center mb-14">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Reach your customers with{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                one Profile SMS platform
              </span>
            </h1>

            <p
              className={`max-w-xl text-sm sm:text-base mb-6 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Upload contacts, segment your audience, and send marketing SMS
              at scale — with live delivery stats, ElasticSearch targeting, and
              flexible pricing plans built for performance campaigns.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-full text-sm sm:text-base font-semibold text-white shadow-xl
                    bg-gradient-to-r from-indigo-600 to-purple-600
                    hover:from-indigo-500 hover:to-purple-500"
                >
                  Get Started – It’s Free
                </motion.button>
              </Link>

              <Link to="/login">
                <button
                  className={`px-5 py-2.5 rounded-full text-sm sm:text-base font-medium border ${
                    darkMode
                      ? "border-gray-600 text-gray-200 hover:bg-gray-800"
                      : "border-gray-300 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Login to your dashboard
                </button>
              </Link>
            </div>

            {/* Small trust / stats line */}
            <div
              className={`flex flex-wrap items-center gap-4 text-xs sm:text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Real-time delivery stats
              </div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-[1px] bg-gray-300 dark:bg-gray-600" />
                ElasticSearch-powered targeting
              </div>
            </div>
          </motion.div>

          {/* Hero side card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`rounded-3xl border shadow-lg p-6 sm:p-7 lg:p-8
              ${darkMode ? "bg-slate-900/80 border-slate-700" : "bg-white/90 border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              ⚡ Why Profile SMS?
            </h3>
            <ul
              className={`space-y-3 text-sm ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <li>• Search and filter contacts with Elasticsearch accuracy.</li>
              <li>• Upload Excel lists and deduplicate automatically.</li>
              <li>• Track sent, pending, and failed messages live.</li>
              <li>• API integration for advanced workflows.</li>
            </ul>

            <div className="mt-5 border-t pt-4 text-xs sm:text-sm flex flex-wrap gap-3">
              <span
                className={`px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
              >
                No long-term contracts
              </span>
              <span
                className={`px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/40"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                }`}
              >
                Pay only for SMS credits
              </span>
            </div>
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <section className="mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold mb-6"
          >
            Everything you need to run serious SMS campaigns
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-3"
          >
            <div
              className={`rounded-2xl p-5 shadow-sm border ${
                darkMode
                  ? "bg-slate-900/80 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="font-semibold mb-2">Smart Targeting</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Filter your database by governorate, gender, and more using
                ElasticSearch-powered queries to hit the right people only.
              </p>
            </div>

            <div
              className={`rounded-2xl p-5 shadow-sm border ${
                darkMode
                  ? "bg-slate-900/80 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="font-semibold mb-2">Live Delivery Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See sent, pending, and failed messages updated in real-time
                inside your dashboard — no guessing, just clear numbers.
              </p>
            </div>

            <div
              className={`rounded-2xl p-5 shadow-sm border ${
                darkMode
                  ? "bg-slate-900/80 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3 className="font-semibold mb-2">Developer Friendly</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use our API integration to trigger SMS from your own systems,
                CRMs, or automations, with full control over quotas.
              </p>
            </div>
          </motion.div>
        </section>

        {/* PRICING SECTION */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Choose your SMS plan
              </h2>
              <p
                className={`text-sm sm:text-base ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Flexible bundles for testing, scaling, and always-on campaigns.
              </p>
            </div>
          </div>

          {loading ? (
            <div
              className={`text-center text-sm sm:text-base ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Loading pricing plans...
            </div>
          ) : plans.length === 0 ? (
            <div
              className={`text-center text-sm sm:text-base ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              No plans configured yet. Please contact support or login as admin
              to add pricing plans.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
              {plans.map((plan, i) => (
                <PricingCard
                  key={plan.id}
                  price={plan.price}
                  sms={plan.sms_amount}
                  color={plan.color}
                  senderIDs={plan.senderIDs}
                  apiIntegration={plan.apiIntegration}
                  support={plan.support}
                  delay={i * 0.08}
                  // Feature the middle plan visually if 3 plans exist
                  featured={plans.length >= 3 && i === 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer
          className={`border-t pt-6 text-xs sm:text-sm flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between ${
            darkMode ? "border-slate-800 text-gray-400" : "border-gray-200 text-gray-500"
          }`}
        >
          <p>© {new Date().getFullYear()} Profile SMS System. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/support" className="hover:underline">
              Contact support
            </a>
            <a href="/login" className="hover:underline">
              Login
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Pricing;

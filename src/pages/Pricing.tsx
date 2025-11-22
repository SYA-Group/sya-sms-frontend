import PricingCard from "../components/PricingCard";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { getPricing } from "../api";

interface Plan {
  id: number;
  sms_amount: string;
  price: string;
  color: string;
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
        setPlans(data);
      } catch (err) {
        console.error("Failed to load pricing", err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  return (
    <div
      className={`min-h-screen px-6 sm:px-10 py-12 transition-all ${
        darkMode
          ? "bg-[#0f172a] text-gray-100"
          : "bg-gradient-to-b from-indigo-200/60 to-white text-gray-900"
      }`}
    >
      {/* Title */}
      <motion.h1
        className="text-4xl font-bold mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        SMS Plans
      </motion.h1>

      {/* Loading */}
      {loading && (
        <div className="text-center text-xl text-gray-500">
          Loading pricing plans...
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.id}
              price={plan.price}
              sms={plan.sms_amount}
              color={plan.color}
              senderIDs={plan.senderIDs}
              apiIntegration={plan.apiIntegration}
              support={plan.support}
              delay={i * 0.1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Pricing;

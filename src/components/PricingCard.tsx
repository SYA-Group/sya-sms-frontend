import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";

interface PricingCardProps {
  price: string;
  sms: string;
  color: string;
  senderIDs?: string;
  apiIntegration?: string;
  support?: string;
  delay?: number;
  featured?: boolean;

  // 🔵 NEW: Start Now callback
  onStart?: (data: {
    sender: string;
    sms_api_url: string;
    api_token: string;
  }) => void;
}

const parseNumber = (value: string): number | null => {
  if (!value) return null;
  const match = value.replace(",", "").match(/[\d.]+/);
  if (!match) return null;
  const num = Number(match[0]);
  return isNaN(num) ? null : num;
};

const PricingCard = ({
  price,
  sms,
  color,
  senderIDs = "Unlimited Sender IDs",
  apiIntegration = "Free Integration with APIs",
  support = "24/7 Support",
  delay = 0,
  featured = false,
  onStart,
}: PricingCardProps) => {
  const priceNum = parseNumber(price);
  const smsNum = parseNumber(sms);
  const costPerSms =
    priceNum !== null && smsNum !== null && smsNum > 0
      ? priceNum / smsNum
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="relative rounded-3xl p-[2px] shadow-xl hover:shadow-2xl transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
      }}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
            bg-yellow-400 text-gray-900 shadow-md"
          >
            <Star
              size={14}
              className="fill-yellow-500 text-yellow-700"
            />
            MOST POPULAR
          </div>
        </div>
      )}

      <div
        className="
          rounded-3xl h-full bg-white/90 dark:bg-slate-900/70
          backdrop-blur-xl px-7 pt-7 pb-6 flex flex-col justify-between
        "
      >
        <div className="mb-6 text-center">
          <h3
            className="
              text-2xl sm:text-3xl font-extrabold tracking-tight
              bg-gradient-to-r from-indigo-600 to-purple-500
              dark:from-indigo-300 dark:to-purple-300
              bg-clip-text text-transparent
            "
          >
            EGP {price}
          </h3>

          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Includes{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {sms}
            </span>{" "}
            SMS credits
          </p>

          {costPerSms !== null && (
            <p className="mt-1 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
              ≈ {costPerSms.toFixed(3)} per SMS
            </p>
          )}
        </div>

        <div className="space-y-3 mb-7 text-sm sm:text-base">
          {[senderIDs, apiIntegration, support].map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
            >
              <CheckCircle
                size={18}
                className="text-emerald-500 dark:text-emerald-400"
              />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* 🔵 Start Now button */}
        {onStart && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-full font-semibold text-sm sm:text-base text-white shadow-lg
              hover:shadow-xl transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, ${color} 0%, ${color}AA 100%)`,
            }}
            onClick={() =>
              onStart({
                sender: senderIDs,
                sms_api_url: apiIntegration,
                api_token: support,
              })
            }
          >
            Start Now
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default PricingCard;

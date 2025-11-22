import { motion } from "framer-motion";

interface PricingCardProps {
  price: string;
  sms: string;
  color: string; // gradient colors like: "from-blue-500 to-indigo-600"
  senderIDs?: string;
  apiIntegration?: string;
  support?: string;
  delay?: number;
}

const PricingCard = ({
  price,
  sms,
  color,
  senderIDs = "Unlimited Sender IDs",
  apiIntegration = "Free Integration with APIs",
  support = "24/7 Support",
  delay = 0,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl shadow-xl overflow-hidden hover:scale-[1.04] transition-all duration-300 bg-gradient-to-br ${color}`}
    >
      {/* Inner white container */}
      <div className="p-6 bg-white dark:bg-slate-900/60 h-full flex flex-col justify-between text-gray-800 dark:text-gray-100">

        {/* Price badge */}
        <div className="inline-block px-4 py-1 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold shadow-sm">
          {price}
        </div>

        {/* SMS Amount */}
        <h2 className="text-3xl font-extrabold tracking-tight mb-4">
          {sms}
        </h2>

        {/* Features */}
        <div className="space-y-2 mb-6 text-gray-600 dark:text-gray-400">
          <p>{senderIDs}</p>
          <p>{apiIntegration}</p>
          <p>{support}</p>
        </div>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className={`w-full py-2.5 rounded-full text-white font-semibold shadow bg-gradient-to-r ${color}`}
        >
          Start Now
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PricingCard;

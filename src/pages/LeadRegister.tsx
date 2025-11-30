import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { sendLeadMessage } from "../api";

const LeadRegister = () => {
  const [params] = useSearchParams();

  const plan = {
    sender: params.get("sender") || "Unknown",
    api: params.get("api") || "N/A",
    token: params.get("token") || "N/A",
    price: params.get("price") || "N/A",
    sms: params.get("sms") || "N/A",
  };

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const message = `
New Lead Registration:

Name: ${form.name}
Company: ${form.company}
Phone: ${form.phone}
Email: ${form.email}

--- Selected Plan ---
Price: ${plan.price} EGP
SMS Amount: ${plan.sms}
Sender IDs: ${plan.sender}
API URL: ${plan.api}
Token: ${plan.token}
    `;

    try {
      await sendLeadMessage({
        name: form.name,
        company: form.company,
        phone: form.phone,
        email: form.email,
        message,
        price: plan.price,
        sms: plan.sms,
        sender: plan.sender,
        api: plan.api,
        token: plan.token,
      });
      
      alert("✅ Thank you! Our team will contact you soon.");
      window.location.href = "/pricing#plans";
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send request.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-20 pb-10 
      bg-gradient-to-br from-slate-50 via-white to-indigo-50 
      dark:from-[#020617] dark:via-slate-900 dark:to-slate-800 px-4">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          w-full max-w-md p-8 rounded-3xl shadow-2xl 
          bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl
          border border-gray-200/60 dark:border-slate-700/60
        "
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold 
            bg-gradient-to-r from-indigo-600 to-purple-600 
            bg-clip-text text-transparent">
            Complete Your Request
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
            Provide your details — our team will contact you shortly.
          </p>
        </div>

        {/* PLAN SUMMARY */}
        <div className="
          mb-6 p-4 rounded-2xl 
          bg-indigo-50/70 dark:bg-indigo-900/30 
          border border-indigo-300/50 dark:border-indigo-800
        ">
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            Selected Plan Details
          </h3>

          <div className="text-sm space-y-1 text-gray-700 dark:text-gray-200">
            <p><strong>Price:</strong> {plan.price} EGP</p>
            <p><strong>SMS Credit:</strong> {plan.sms}</p>
            <p><strong>Sender IDs:</strong> {plan.sender}</p>
            <p><strong>API:</strong> {plan.api}</p>
            <p><strong>Token:</strong> {plan.token}</p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {["name", "company", "phone", "email"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field[0].toUpperCase() + field.slice(1)}
              </label>
              <input
                required
                type={field === "email" ? "email" : "text"}
                placeholder={`Enter your ${field}`}
                className="
                  w-full px-4 py-3 rounded-xl 
                  bg-gray-50 dark:bg-slate-800
                  border border-gray-300 dark:border-gray-700
                  text-gray-900 dark:text-gray-100
                "
                value={form[field as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
              />
            </div>
          ))}

          {/* SUBMIT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="
              w-full py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-500 hover:to-purple-500
              shadow-lg
            "
          >
            {loading ? "Processing..." : "Submit Request"}
          </motion.button>
        </form>

        {/* BACK LINK */}
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/pricing#plans" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Back to Pricing Plans
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LeadRegister;

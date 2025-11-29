import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { sendSupportMessage } from "../api";

const LeadRegister = () => {
  const [params] = useSearchParams();

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

    const planInfo = `
Selected Plan Info:
Sender IDs: ${params.get("sender")}
API: ${params.get("api")}
Token: ${params.get("token")}
    `;

    const body = `
New Lead Registration (Anonymous):

Name: ${form.name}
Company: ${form.company}
Phone: ${form.phone}
Email: ${form.email}

${planInfo}
    `;

    try {
      await sendSupportMessage({ message: body });

      alert("✅ Thank you! Our team will contact you soon.");
      window.location.href = "/pricing#plans";
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send request.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-xl shadow-lg bg-white dark:bg-slate-800">
      <h2 className="text-xl font-bold mb-4">Complete Your Request</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Fill in your details and our team will contact you shortly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "company", "phone", "email"].map((field) => (
          <input
            key={field}
            required
            type="text"
            className="w-full border rounded-lg px-4 py-2 dark:bg-slate-700"
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={form[field as keyof typeof form]}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
          />
        ))}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold bg-indigo-600 text-white"
        >
          {loading ? "Processing..." : "Submit Request"}
        </motion.button>
      </form>
    </div>
  );
};

export default LeadRegister;

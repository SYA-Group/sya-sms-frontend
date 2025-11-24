import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getPricing,
  createPricing,
  updatePricingPlan,
  deletePricingPlan,
} from "../api";
import { useTheme } from "../context/ThemeContext";
import { Edit3, Trash2, PlusCircle } from "lucide-react";

interface Plan {
  id: number;
  sms_amount: string;
  price: string;
  color: string;
  senderIDs: string;
  apiIntegration: string;
  support: string;
}

const emptyForm: Omit<Plan, "id"> = {
  sms_amount: "",
  price: "",
  color: "#6366f1",
  senderIDs: "Unlimited Sender IDs",
  apiIntegration: "API Supported",
  support: "Basic Support",
};

const PricingAdmin = () => {
  const { darkMode } = useTheme();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const isEditing = editingId !== null;

  const [messages, setMessages] = useState<Record<string, string>>({});

  // Load plans
  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getPricing();
      setPlans(data || []);
    } catch (err) {
      console.error(err);
      setMessages({ general: "Failed to load pricing plans." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // clear field error
    setMessages((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!form.sms_amount.trim()) errs.sms_amount = "SMS amount is required.";
    if (!form.price.trim()) errs.price = "Price is required.";

    setMessages(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessages({});
    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        sms: form.sms_amount,
        price: form.price,
        color: form.color,
        senderIDs: form.senderIDs,
        apiIntegration: form.apiIntegration,
        support: form.support,
      };

      if (isEditing && editingId !== null) {
        await updatePricingPlan(editingId, payload);
        setMessages({ success: "Pricing plan updated successfully!" });
      } else {
        await createPricing(payload);
        setMessages({ success: "Pricing plan created successfully!" });
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadPlans();
    } catch (err) {
      console.error(err);
      setMessages({ general: "Failed to save pricing plan." });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setMessages({});
    setForm({
      sms_amount: plan.sms_amount,
      price: plan.price,
      color: plan.color,
      senderIDs: plan.senderIDs,
      apiIntegration: plan.apiIntegration,
      support: plan.support,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessages({});
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this pricing plan?")) return;

    setDeletingId(id);

    try {
      await deletePricingPlan(id);
      setMessages({ success: "Pricing plan deleted." });

      await loadPlans();
      if (editingId === id) resetForm();
    } catch (err) {
      setMessages({ general: "Failed to delete pricing plan." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className={`min-h-screen px-6 sm:px-10 py-10 transition-all duration-300 ${
        darkMode ? "bg-[#0f172a] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-10 text-center tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Pricing Management
      </motion.h1>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* LEFT SIDE → TABLE */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`rounded-2xl shadow-lg border overflow-hidden ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold">Existing Plans</h2>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <PlusCircle size={16} />
              New Plan
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center opacity-70">Loading...</div>
          ) : plans.length === 0 ? (
            <div className="p-6 text-center opacity-70">
              No pricing plans yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className={`w-full text-sm ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                <thead className={darkMode ? "bg-slate-900" : "bg-gray-100"}>
                  <tr>
                    <th className="px-4 py-3 text-left">SMS</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Color</th>
                    <th className="px-4 py-3 text-left">Sender IDs</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody
                  className={`divide-y ${
                    darkMode ? "divide-slate-700" : "divide-gray-200"
                  }`}
                >
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-4 py-3">{plan.sms_amount}</td>
                      <td className="px-4 py-3">{plan.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: plan.color }}
                          />
                          <span className="font-mono text-xs">{plan.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[130px] truncate">
                        {plan.senderIDs}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(plan)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(plan.id)}
                            disabled={deletingId === plan.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            {deletingId === plan.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* RIGHT SIDE → FORM */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className={`rounded-2xl shadow-lg border p-8 ${
            darkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <h2 className="text-xl font-semibold mb-1">
            {isEditing ? "Edit Pricing Plan" : "Create New Plan"}
          </h2>

          {messages.success && (
            <motion.div
              className="text-green-500 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {messages.success}
            </motion.div>
          )}

          {messages.general && (
            <motion.div
              className="text-red-500 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {messages.general}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              {
                label: "📩 SMS Amount",
                field: "sms_amount",
                placeholder: "1000",
              },
              {
                label: "💵 Price",
                field: "price",
                placeholder: "150",
              },
              {
                label: "🆔 Sender IDs",
                field: "senderIDs",
                placeholder: "",
              },
              {
                label: "🔌 API Integration",
                field: "apiIntegration",
                placeholder: "",
              },
              {
                label: "🛠 Support Level",
                field: "support",
                placeholder: "",
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col gap-1">
                <label className="font-semibold">{item.label}</label>

                <input
                  value={(form as any)[item.field]}
                  onChange={(e) => handleChange(item.field as any, e.target.value)}
                  placeholder={item.placeholder}
                  className={`px-4 py-3 rounded-xl border shadow-sm outline-none focus:ring-2 transition 
                    ${
                      darkMode
                        ? "bg-slate-900 border-slate-700 focus:ring-indigo-400 text-gray-100"
                        : "bg-gray-50 border-gray-300 focus:ring-indigo-500 text-gray-900"
                    }`}
                />

                {messages[item.field] && (
                  <motion.p
                    className="text-sm text-red-500"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {messages[item.field]}
                  </motion.p>
                )}

                {!messages[item.field] &&
                  (form as any)[item.field] !== "" &&
                  (item.field === "sms_amount" || item.field === "price") && (
                    <motion.p
                      className="text-sm text-green-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Looks good ✓
                    </motion.p>
                  )}
              </div>
            ))}

            {/* Color Picker */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">🎨 Card Color</label>

              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-16 h-12 rounded-lg cursor-pointer border"
                />

                <div
                  className="h-12 w-12 rounded-xl border"
                  style={{ backgroundColor: form.color }}
                />
              </div>

              <p className="text-green-500 text-sm">Color selected ✓</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-white font-semibold bg-gradient-to-r 
                  from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Plan"}
              </motion.button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-4 py-3 rounded-xl font-medium border ${
                    darkMode
                      ? "border-slate-600 bg-slate-900 hover:bg-slate-800"
                      : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingAdmin;

import { useState, useEffect } from "react";
import { getUserInfo, updateEmail } from "../api";
import { useNavigate } from "react-router-dom";

interface UpdateEmailProps {
  onEmailUpdated?: () => void; // optional callback to refresh header
}

const UpdateEmail = ({ onEmailUpdated }: UpdateEmailProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await getUserInfo();
        setEmail(res.email || "");
      } catch (err) {
        console.warn("⚠️ Could not load user info:", err);
      }
    };
    fetchEmail();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await updateEmail(email);
      setMessage(res.message);
      navigate("/dashboard")

      // ✅ trigger header refresh
      if (onEmailUpdated) onEmailUpdated();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Update Email
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Updating..." : "Update Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateEmail;

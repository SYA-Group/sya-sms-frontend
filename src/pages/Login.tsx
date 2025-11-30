import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();

  // ⭐ Auto-fill username & password from cookies
  const [username, setUsername] = useState(Cookies.get("saved_username") || "");
  const [password, setPassword] = useState(Cookies.get("saved_password") || "");
  const [remember, setRemember] = useState(
    Cookies.get("saved_username") ? true : false
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ Auto redirect ONLY if token exists (not cookies)
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(username, password);

      // ⭐ Save login info in cookies (if remember is checked)
      if (remember) {
        Cookies.set("saved_username", username, { expires: 30 });
        Cookies.set("saved_password", password, { expires: 30 });
      } else {
        Cookies.remove("saved_username");
        Cookies.remove("saved_password");
      }

      // ⭐ Store tokens — unchanged behavior
      if (remember) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
      } else {
        sessionStorage.setItem("token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          SMS Dashboard Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4"
              />
              Remember Me
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline dark:text-blue-400 text-sm"
          >
            Forgot Password?
          </Link>
        </div>

          {/* Create Account → Go to Pricing Plans */}
      <div className="mt-3 text-center">
        <Link
          to="/pricing#plans"
          className="text-indigo-600 hover:underline dark:text-indigo-400 text-sm font-semibold"
        >
          Don’t have an account? View SMS Plans →
        </Link>
      </div>

      </motion.div>
    </div>
  );
};

export default Login;

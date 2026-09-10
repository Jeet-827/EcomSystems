import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ADMIN_API_BASE_URL } from "../config/api.config.js";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from "react-icons/fi";

function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        `${ADMIN_API_BASE_URL}/api/v1/admin/adminsignin`,
        { email: email.trim(), password },
        { withCredentials: true }
      );

      setMessage({
        text: res.data.message || "Login successful! Redirecting...",
        type: "success",
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 300);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Invalid email or password. Please try again.";
      setMessage({ text: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text-main)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors relative">
      
      {/* Top Bar with Navigation & Theme Toggle */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] transition-colors"
        >
          <FiArrowLeft className="text-base" />
          <span>Back to main store</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="admin-theme-toggle"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white mb-4 shadow-lg shadow-indigo-500/25">
          <FiShield className="text-2xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--admin-text-main)]">
          Admin Portal
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--admin-text-muted)]">
          Sign in with authorized administrative credentials
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="admin-card p-6 sm:p-8 shadow-xl">
          
          {/* Error / Success Alert */}
          {message.text && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}
            >
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5"
              >
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--admin-text-subtle)]">
                  <FiMail className="h-4 w-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="admin-input pl-10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--admin-text-subtle)]">
                  <FiLock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full admin-btn-primary py-2.5 shadow-md"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-[var(--admin-card-border-subtle)] text-center">
            <p className="text-[11px] text-[var(--admin-text-subtle)]">
              🔒 Protected by HTTP-only session cookies and JWT encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

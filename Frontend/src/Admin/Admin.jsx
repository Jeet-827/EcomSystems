import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ADMIN_API_BASE_URL } from "../config/api.config.js";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4 font-sans">
      {/* Subtle background dot glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Main Card */}
        <div className="bg-[#1e1e1e] rounded-3xl shadow-2xl border border-white/10 p-7 sm:p-8 space-y-6">
          {/* Brand & Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#10b981] text-black flex items-center justify-center font-black text-lg shadow-md font-['Outfit']">
                A
              </div>
              <span className="font-extrabold text-white text-xl tracking-wider font-['Outfit']">
                AURA
              </span>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-extrabold tracking-widest bg-emerald-500/10 text-[#10b981] border border-emerald-500/20 rounded-full uppercase">
              ADMIN PORTAL
            </span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
              ADMIN LOGIN
            </h1>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">
              Sign in with administrative credentials
            </p>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
                message.type === "success"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/60 border-rose-500/40 text-rose-300"
              }`}
            >
              <span>{message.type === "success" ? "✅" : "⚠️"}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <div className="space-y-1.5">
              <label
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest"
                htmlFor="admin-email"
              >
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-zinc-400">
                  ✉️
                </span>
                <input
                  id="admin-email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  placeholder="admin@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest"
                htmlFor="admin-password"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-zinc-400">
                  🔒
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 bg-[#121212] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-white active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              )}
              {loading ? "AUTHENTICATING..." : "SIGN IN TO DASHBOARD →"}
            </button>
          </form>

          {/* Security Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-zinc-500 font-semibold uppercase">
              SECURITY
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-xs text-zinc-400">
            🔒 Protected by encrypted JWT administrative session.
          </p>
        </div>

        {/* Back to Home Link */}
        <p className="text-center mt-4 text-xs text-zinc-500">
          <Link
            to="/"
            className="hover:text-white transition-colors font-semibold uppercase tracking-wider"
          >
            ← Back to Main Store
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Admin;


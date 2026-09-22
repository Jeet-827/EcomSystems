import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaGithub, FaEnvelope, FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };
  const handleGithub = () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  };

  const navigate = useNavigate();
  const { setUser, setToken } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const data = { email, password };
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/signin`,
        data,
        { withCredentials: true }
      );
      setUser(res.data.user);
      setToken(res.data.AccessToken || res.data.Accesstoken || res.data.accessToken);
      setMessage({ text: res.data.message || "Login successful!", type: "success" });
      navigate("/home");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Invalid email or password!";
      setMessage({ text: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] text-white flex items-center justify-center font-black text-xl shadow-md font-['Outfit']">
              T
            </div>
            <span className="font-black text-slate-900 text-2xl tracking-tight font-['Outfit']">
              TREO<span className="text-[#4f46e5]">.</span>
            </span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit']">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Sign in to manage your orders, wishlist, and smart devices.
            </p>
          </div>

          {/* Alert */}
          {message.text && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {message.type === "success" ? (
                <FaCheckCircle className="text-emerald-600" />
              ) : (
                <FaExclamationTriangle className="text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-slate-400">
                  <FaEnvelope size={13} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5] transition-all"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-slate-400">
                  <FaLock size={13} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider btn-purple-primary disabled:opacity-60 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              )}
              {loading ? "Signing in..." : "SIGN IN →"}
            </button>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.56 0 2.98.54 4.09 1.58l3.07-3.07C17.3 1.83 14.84 1 12 1 7.42 1 3.51 3.59 1.54 7.36l3.7 2.87C6.18 7.39 8.84 5 12 5z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.7z" />
                <path fill="#FBBC05" d="M5.24 14.77c-.25-.74-.38-1.53-.38-2.35s.13-1.61.38-2.35L1.54 7.2C.56 9.16 0 11.35 0 13.7s.56 4.54 1.54 6.5l3.7-2.87c-.25-.74-.38-1.53-.38-2.56z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.16 0-5.82-2.39-6.76-5.23L1.54 16c1.97 3.77 5.88 6.36 10.46 6.36z" />
              </svg>
              Continue with Google
            </button>

            {/* GitHub Login */}
            <button
              type="button"
              onClick={handleGithub}
              className="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-black text-white shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <FaGithub size={16} />
              Continue with GitHub
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-bold uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Redirect */}
          <p className="text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-[#4f46e5] hover:underline">
              Create one for free
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-4 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-700 transition-colors font-semibold uppercase tracking-wider">
            ← Back to Store
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

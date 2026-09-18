import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();
  const { setUser, setToken } = useUser();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const data = { name, email, password };
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/signup`,
        data,
        { withCredentials: true }
      );
      setUser(res.data.user);
      setToken(res.data.AccessToken || res.data.Accesstoken || res.data.accessToken);
      setMessage({ text: res.data.message || "Account created!", type: "success" });
      navigate("/home");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong!";
      setMessage({ text: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4">
      {/* Subtle background glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-[#1e1e1e] rounded-3xl shadow-2xl border border-white/10 p-7 sm:p-8 space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#10b981] text-black flex items-center justify-center font-black text-lg shadow-md font-['Outfit']">
              A
            </div>
            <span className="font-extrabold text-white text-xl tracking-wider font-['Outfit']">AURA</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">CREATE ACCOUNT</h1>
            <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">Join AURA luxury membership today</p>
          </div>

          {/* Alert */}
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
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest" htmlFor="reg-name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-zinc-400">👤</span>
                <input
                  id="reg-name"
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest" htmlFor="reg-email">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-zinc-400">✉️</span>
                <input
                  id="reg-email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-zinc-400">🔒</span>
                <input
                  id="reg-password"
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
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
              {loading ? "Creating account..." : "CREATE ACCOUNT →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-zinc-500 font-semibold uppercase">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Redirect */}
          <p className="text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#10b981] hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-4 text-xs text-zinc-500">
          <Link to="/" className="hover:text-white transition-colors font-semibold uppercase tracking-wider">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

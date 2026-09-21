import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Profile = () => {
  const { user, token, setUser } = useUser();
  const [activeTab, setActiveTab] = useState("edit details");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Edit details state
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/api/v1/order/ordersget`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId: user?._id || user?.id },
        });
      } catch {
        response = await axios.get(`${API_BASE_URL}/api/v1/order/showorder`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      const fetched = response.data.orders || response.data.data || [];
      const userOrders = fetched.filter(
        (o) =>
          !user?._id ||
          (typeof o.userid === "object" ? o.userid?._id === user._id : o.userid === user._id)
      );
      setOrders(userOrders.length > 0 ? userOrders : fetched);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (activeTab === "My order page" && token) {
      fetchOrders();
    }
  }, [activeTab, token, fetchOrders]);

  const handleChangePassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match!");
        return;
      }
      setPassLoading(true);
      try {
        await axios.post(
          `${API_BASE_URL}/api/v1/userdata/changepassword`,
          {
            oldPassword,
            newPassword,
            userId: user?._id || user?.id,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );
        toast.success("Password updated successfully! 🔑");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update password.");
      } finally {
        setPassLoading(false);
      }
    },
    [oldPassword, newPassword, confirmPassword, token, user]
  );

  const handleEditDetails = useCallback(
    async (e) => {
      e.preventDefault();
      setEditLoading(true);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/v1/userdata/updateprofile`,
          {
            name: editName,
            email: editEmail,
            userId: user?._id || user?.id,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );
        toast.success("Profile updated successfully! ✨");
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update profile.");
      } finally {
        setEditLoading(false);
      }
    },
    [token, editName, editEmail, setUser, user]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "edit details":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider font-['Outfit']">Personal Information</h2>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Update your account details and contact information.</p>
            </div>

            <form onSubmit={handleEditDetails} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all text-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </form>
          </div>
        );

      case "Change pass":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider font-['Outfit']">Security & Password</h2>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Ensure your account stays safe with a strong password.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 bg-[#121212] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all text-sm"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 z-10"
                    title={showOldPassword ? "Hide password" : "Show password"}
                  >
                    {showOldPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 bg-[#121212] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all text-sm"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 z-10"
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 bg-[#121212] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all text-sm"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 z-10"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {passLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        );

      case "My order page":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider font-['Outfit']">My Orders</h2>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">View your luxury order history and tracking status.</p>
              </div>
              <span className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
                {orders.length} Order(s)
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-9 h-9 border-4 border-white/20 border-t-[#10b981] rounded-full animate-spin" />
                <p className="text-zinc-400 text-xs uppercase tracking-widest">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-sm text-center">
                ⚠️ {error}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-[#181818] border border-white/10 rounded-2xl">
                <div className="text-5xl mb-3">🛍️</div>
                <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">No Orders Found</h3>
                <p className="text-zinc-400 text-xs uppercase tracking-widest">You haven't placed any luxury orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-[#181818] border border-white/10 rounded-2xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <span className="text-xs text-zinc-500 block font-medium uppercase tracking-widest">ORDER ID</span>
                        <span className="font-bold text-sm text-[#10b981]">#{order._id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider ${
                            order.status === "pending"
                              ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider ${
                            order.payment === "unpaid"
                              ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          PAYMENT: {order.payment.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {order.productid && order.productid.length > 0 && (
                      <div className="space-y-3">
                        {order.productid.map((prod, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 bg-[#121212] p-3 rounded-xl border border-white/5"
                          >
                            {prod.productimage && prod.productimage.length > 0 ? (
                              <img
                                src={Array.isArray(prod.productimage) ? prod.productimage[0] : prod.productimage}
                                alt={prod.title}
                                className="w-14 h-14 object-contain rounded-lg bg-[#181818] border border-white/10 p-1"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-[#181818] rounded-lg flex items-center justify-center text-xs text-zinc-500 font-bold">
                                ITEM
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-white line-clamp-1">
                                {prod.title}
                              </h4>
                              <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                                {prod.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-[#10b981] block">
                                ₹{prod.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
          <div className="w-10 h-10 border-4 border-white/20 border-t-[#10b981] rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium uppercase tracking-widest">Loading session...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        {/* User Profile Header Card */}
        <div className="bg-[#1e1e1e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl shrink-0 bg-[#10b981] text-black shadow-lg"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider font-['Outfit'] uppercase">
                  {user.name || "Customer Profile"}
                </h1>
                <span className="bg-[#10b981]/20 text-[#10b981] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#10b981]/30">
                  Verified Member
                </span>
              </div>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">{user.email || "Registered User"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#121212] border border-white/10 rounded-2xl p-3 px-5">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-widest">ACCOUNT</span>
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">Active</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-widest">TIER</span>
              <span className="text-xs font-extrabold text-[#10b981] uppercase tracking-wider">AURA VIP</span>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1 bg-[#1e1e1e] border border-white/10 rounded-3xl p-3 md:p-4 shadow-sm h-fit">
            <nav className="flex md:flex-col overflow-x-auto scrollbar-none gap-2 md:space-y-1.5 snap-x">
              <button
                onClick={() => setActiveTab("edit details")}
                className={`shrink-0 snap-start px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "edit details"
                    ? "bg-[#10b981] text-white shadow-md"
                    : "text-zinc-400 hover:bg-[#121212] hover:text-white"
                }`}
              >
                <span>👤</span>
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setActiveTab("Change pass")}
                className={`shrink-0 snap-start px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "Change pass"
                    ? "bg-[#10b981] text-white shadow-md"
                    : "text-zinc-400 hover:bg-[#121212] hover:text-white"
                }`}
              >
                <span>🔐</span>
                <span>Change Password</span>
              </button>

              <button
                onClick={() => setActiveTab("My order page")}
                className={`shrink-0 snap-start px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "My order page"
                    ? "bg-[#10b981] text-white shadow-md"
                    : "text-zinc-400 hover:bg-[#121212] hover:text-white"
                }`}
              >
                <span>📦</span>
                <span>My Orders</span>
              </button>

              <button
                onClick={() => {
                  setUser(null);
                  setToken("");
                  navigate("/login");
                }}
                className={`shrink-0 snap-start px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-rose-400 hover:bg-rose-950/40 transition-all duration-200 flex items-center gap-2.5 cursor-pointer`}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Content Body */}
          <div className="md:col-span-3 bg-[#1e1e1e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

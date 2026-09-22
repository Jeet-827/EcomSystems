import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  FaUser,
  FaShoppingBag,
  FaKey,
  FaSignOutAlt,
  FaCheckCircle,
  FaShieldAlt,
  FaBoxOpen,
} from "react-icons/fa";

const Profile = () => {
  const { user, token, setUser, logout } = useUser();
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
        toast.success("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to change password.");
      } finally {
        setPassLoading(false);
      }
    },
    [newPassword, confirmPassword, oldPassword, user, token]
  );

  const handleEditDetails = useCallback(
    async (e) => {
      e.preventDefault();
      if (!editName.trim()) {
        toast.error("Name cannot be empty!");
        return;
      }
      setEditLoading(true);
      try {
        const res = await axios.put(
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
        if (res.data.user) {
          setUser(res.data.user);
        } else {
          setUser((prev) => ({ ...prev, name: editName, email: editEmail }));
        }
        toast.success("Profile details updated successfully!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update profile.");
      } finally {
        setEditLoading(false);
      }
    },
    [editName, editEmail, user, token, setUser]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "edit details":
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Profile Details</h2>
              <p className="text-xs text-slate-500 mt-1">Manage your personal account credentials.</p>
            </div>

            <form onSubmit={handleEditDetails} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4f46e5] text-xs"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400">Email is linked to authentication.</span>
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="px-6 py-3 btn-purple-primary text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        );

      case "change password":
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Change Password</h2>
              <p className="text-xs text-slate-500 mt-1">Update your password to keep your account safe.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4f46e5] text-xs"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showOldPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4f46e5] text-xs"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#4f46e5] text-xs"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="px-6 py-3 btn-purple-primary text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {passLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        );

      case "My order page":
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-['Outfit']">My Orders</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track your past hardware purchases.</p>
              </div>
              <span className="badge-category">{orders.length} Order(s)</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="spinner-purple" />
                <p className="text-slate-400 text-xs font-bold uppercase">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs text-center font-semibold">
                ⚠️ {error}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-5xl">📦</div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">No Orders Found</h3>
                <p className="text-xs text-slate-500">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Order ID</span>
                        <span className="font-black text-xs text-[#4f46e5]">#{order._id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge-featured">{order.status?.toUpperCase() || "CONFIRMED"}</span>
                        <span className="badge-discount">{order.payment === "paid" ? "PAID" : "COD"}</span>
                      </div>
                    </div>

                    {order.productid && order.productid.length > 0 && (
                      <div className="space-y-2">
                        {order.productid.map((prod, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100"
                          >
                            <img
                              src={Array.isArray(prod?.productimage) ? prod.productimage[0] : prod?.productimage || "https://via.placeholder.com/50"}
                              alt={prod?.title}
                              className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {prod?.title || "Tech Gadget"}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {prod?.description}
                              </p>
                            </div>
                            <span className="text-xs font-black text-slate-900">
                              ₹{Number(prod?.price || 0).toLocaleString()}
                            </span>
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

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* User Greeting Card */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-2xl border border-white/30 shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">
                TREO VIP Member
              </span>
              <h1 className="text-2xl font-black font-['Outfit']">{user?.name || "Customer"}</h1>
              <p className="text-xs text-indigo-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-1">
              {[
                { id: "edit details", label: "Edit Profile", icon: FaUser },
                { id: "change password", label: "Change Password", icon: FaKey },
                { id: "My order page", label: "My Orders", icon: FaShoppingBag },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#4f46e5] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Tab Content */}
          <section className="lg:col-span-9">{renderContent()}</section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

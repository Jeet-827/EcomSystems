import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { ADMIN_API_BASE_URL, API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import adminAudio from "./utils/adminAudio.js";

const Customersmanage = () => {
  const [alluserfound, setAlluserfound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => adminAudio.isSoundEnabled());
  const [selectedUser, setSelectedUser] = useState(null);

  const toggleSound = () => {
    const next = !soundEnabled;
    adminAudio.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      adminAudio.playCartChime();
      toast.info("Cart sound notifications enabled");
    } else {
      toast.info("Cart sound notifications muted");
    }
  };

  const getalluser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      try {
        res = await axios.get(`${ADMIN_API_BASE_URL}/api/v1/user/alluser`, {
          withCredentials: true,
        });
      } catch {
        res = await axios.get(`${API_BASE_URL}/api/v1/alluser`, {
          withCredentials: true,
        });
      }

      const usersList =
        res.data.AllUser || res.data.users || res.data.allUser || res.data.data || [];
      setAlluserfound(usersList);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to fetch customer directory from database.");
      toast.error("Failed to load customer list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getalluser();
  }, [getalluser]);

  /* Filter customers by search */
  const filteredUsers = useMemo(() => {
    return alluserfound.filter((u) => {
      const q = search.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u._id || "").toLowerCase().includes(q)
      );
    });
  }, [alluserfound, search]);

  /* Metrics */
  const metrics = useMemo(() => {
    const totalUsers = alluserfound.length;
    const activeCarts = alluserfound.filter((u) => u.cartitem?.length > 0).length;
    const totalOrdersPlaced = alluserfound.reduce(
      (sum, u) => sum + (u.orderId?.length || 0),
      0
    );
    return { totalUsers, activeCarts, totalOrdersPlaced };
  }, [alluserfound]);

  return (
    <div className="admin-layout font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Nav />

      <main className="admin-main">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--admin-card-border)]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">👥</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight">
                  Customer Directory
                </h1>
              </div>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                Registered customer accounts, shopping carts, and order history from MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`admin-sound-toggle ${soundEnabled ? "active" : ""}`}
                title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
              >
                <span>{soundEnabled ? "🔔" : "🔕"}</span>
                <span>{soundEnabled ? "Live Sound On" : "Live Sound Off"}</span>
              </button>

              <button
                onClick={getalluser}
                className="admin-btn-secondary text-xs sm:text-sm py-2 px-3.5"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                👥
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Registered Users
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5">
                  {metrics.totalUsers}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
                🛒
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Active Shopping Carts
                </p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {metrics.activeCarts}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                📦
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Total Orders Linked
                </p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {metrics.totalOrdersPlaced}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="admin-card p-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--admin-text-muted)]">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search customers by name, email, or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input pl-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Customer Table */}
          {loading ? (
            <div className="admin-card p-16 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                Loading customer records...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-card p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--admin-bg-secondary)] flex items-center justify-center text-2xl mx-auto">
                👥
              </div>
              <h3 className="text-base font-bold text-[var(--admin-text-main)]">
                No customers found
              </h3>
              <p className="text-xs text-[var(--admin-text-muted)]">
                {search ? "No customer accounts match your search filter." : "The database currently has no registered customers."}
              </p>
            </div>
          ) : (
            <div className="admin-table-container">
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Email Address</th>
                      <th>User ID</th>
                      <th>Cart Items</th>
                      <th>Orders</th>
                      <th>Member Since</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => {
                      const initials = (u.name || u.email || "U")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={u._id || idx}>
                          <td className="text-xs font-mono text-[var(--admin-text-subtle)]">
                            {idx + 1}
                          </td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                {initials}
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-[var(--admin-text-main)]">
                                {u.name || "Customer"}
                              </span>
                            </div>
                          </td>
                          <td className="font-mono text-xs text-[var(--admin-text-muted)]">
                            {u.email}
                          </td>
                          <td className="font-mono text-xs text-[var(--admin-text-subtle)]">
                            {u._id?.slice(-8) || "N/A"}
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-pending text-[11px]">
                              🛒 {u.cartitem?.length || 0} items
                            </span>
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-delivered text-[11px]">
                              📦 {u.orderId?.length || 0} orders
                            </span>
                          </td>
                          <td className="text-xs text-[var(--admin-text-muted)]">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="admin-btn-secondary text-xs py-1.5 px-3"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Customer Inspect Drawer/Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="admin-card p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--admin-card-border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                  {(selectedUser.name || selectedUser.email || "U").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--admin-text-main)]">
                    {selectedUser.name || "Customer Details"}
                  </h3>
                  <p className="text-xs text-[var(--admin-text-muted)] font-mono">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] hover:bg-[var(--admin-bg-secondary)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-card-border-subtle)]">
                <div>
                  <span className="text-[10px] font-bold text-[var(--admin-text-subtle)] uppercase block">
                    Full User ID
                  </span>
                  <span className="font-mono text-[var(--admin-text-main)] font-semibold break-all">
                    {selectedUser._id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--admin-text-subtle)] uppercase block">
                    Registered On
                  </span>
                  <span className="text-[var(--admin-text-main)] font-semibold">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[var(--admin-text-main)] mb-2">
                  Active Cart Items ({selectedUser.cartitem?.length || 0})
                </h4>
                {selectedUser.cartitem && selectedUser.cartitem.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {selectedUser.cartitem.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[var(--admin-bg-secondary)] flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-[var(--admin-text-main)]">
                          {typeof item === "object" ? item.title || "Cart Item" : `Item ID: ${item}`}
                        </span>
                        {typeof item === "object" && item.price && (
                          <span className="font-bold text-[var(--admin-accent)]">
                            ₹{item.price}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--admin-text-muted)] italic">
                    Shopping cart is currently empty.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="admin-btn-secondary text-xs py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customersmanage;

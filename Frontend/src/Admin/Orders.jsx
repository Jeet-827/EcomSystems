import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { ADMIN_API_BASE_URL, API_BASE_URL } from "../config/api.config.js";
import { Link, useNavigate } from "react-router-dom";
import Nav from "./Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import adminAudio from "./utils/adminAudio.js";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => adminAudio.isSoundEnabled());
  const navigate = useNavigate();

  /* Toggle live audio alert chime */
  const toggleSound = () => {
    const next = !soundEnabled;
    adminAudio.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      adminAudio.playPaidOrderChime();
      toast.info("Audio notifications enabled");
    } else {
      toast.info("Audio notifications muted");
    }
  };

  /* Fetch all orders from admin backend */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await axios.get(`${ADMIN_API_BASE_URL}/api/v1/order/showorder`, {
          withCredentials: true,
        });
      } catch {
        res = await axios.get(`${API_BASE_URL}/api/v1/order/showorder`, {
          withCredentials: true,
        });
      }
      const data = res.data.orders || res.data.Od || res.data.order || res.data.data || [];
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load customer orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* Handle status update (pending / shipping / delivered / cancelled) */
  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      try {
        await axios.put(
          `${ADMIN_API_BASE_URL}/api/v1/order/updatestatus/${orderId}`,
          { status: newStatus },
          { withCredentials: true }
        );
      } catch {
        await axios.put(
          `${API_BASE_URL}/api/v1/order/updatestatus/${orderId}`,
          { status: newStatus },
          { withCredentials: true }
        );
      }

      // Play audio feedback tone
      if (newStatus.toLowerCase() === "delivered") {
        adminAudio.playPaidOrderChime();
      } else {
        adminAudio.playAlertChime();
      }

      toast.success(`Order marked as ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  /* Filtered orders */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = search.toLowerCase();
      const orderIdMatch = (order._id || "").toLowerCase().includes(q);
      const customerMatch =
        (order.name || "").toLowerCase().includes(q) ||
        (order.email || "").toLowerCase().includes(q) ||
        (order.address || "").toLowerCase().includes(q);
      const statusMatches =
        statusFilter === "all" ||
        (order.status || "").toLowerCase() === statusFilter.toLowerCase();
      return (orderIdMatch || customerMatch) && statusMatches;
    });
  }, [orders, search, statusFilter]);

  /* Calculate order revenue metrics */
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    const totalRevenue = orders.reduce((sum, o) => {
      const orderTotal = o.productid?.reduce((acc, p) => acc + (parseFloat(p?.price) || 0), 0) || 0;
      return sum + orderTotal;
    }, 0);
    return { total, pending, delivered, totalRevenue };
  }, [orders]);

  /* Status badge styling helper */
  const getBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "admin-badge-pending";
      case "shipping":
        return "admin-badge-shipping";
      case "delivered":
        return "admin-badge-delivered";
      case "cancelled":
        return "admin-badge-cancelled";
      default:
        return "admin-badge-pending";
    }
  };

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
                <span className="text-2xl">🚚</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight">
                  Customer Orders
                </h1>
              </div>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                Real-time order processing, status workflows, and fulfillment tracking.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sound Notifications Toggle */}
              <button
                onClick={toggleSound}
                className={`admin-sound-toggle ${soundEnabled ? "active" : ""}`}
                title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
              >
                <span>{soundEnabled ? "🔔" : "🔕"}</span>
                <span>{soundEnabled ? "Sound On" : "Sound Off"}</span>
              </button>

              <button
                onClick={fetchOrders}
                className="admin-btn-secondary text-xs sm:text-sm py-2 px-3.5"
                title="Refresh Orders"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="admin-stat-card">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                📋
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5">
                  {metrics.total}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
                ⏳
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Pending
                </p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {metrics.pending}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                ✅
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Delivered
                </p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {metrics.delivered}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
                💵
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Gross Sales
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5">
                  ₹{metrics.totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Status Filters */}
          <div className="admin-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--admin-text-muted)]">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by Order ID, customer name, email, city..."
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

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                {["all", "pending", "shipping", "delivered", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all flex-shrink-0 cursor-pointer ${
                      statusFilter === status
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Listing */}
          {loading ? (
            <div className="admin-card p-16 text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                Loading order records...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-card p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--admin-bg-secondary)] flex items-center justify-center text-2xl mx-auto">
                📦
              </div>
              <h3 className="text-base font-bold text-[var(--admin-text-main)]">
                No orders match your criteria
              </h3>
              <p className="text-xs text-[var(--admin-text-muted)]">
                Try resetting search queries or filtering by a different order status.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const items = order.productid || [];
                const orderTotal = items.reduce(
                  (sum, item) => sum + (parseFloat(item?.price) || 0),
                  0
                );
                const isPaid = (order.payment || "").toLowerCase() === "paid";

                return (
                  <div
                    key={order._id}
                    className="admin-card p-5 sm:p-6 transition-all hover:border-[var(--admin-accent)] space-y-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--admin-card-border-subtle)]">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[var(--admin-text-muted)]">
                          ID: <span className="text-[var(--admin-text-main)]">{order._id?.slice(-8)}</span>
                        </span>
                        <span className="text-xs text-[var(--admin-text-subtle)]">•</span>
                        <span className="text-xs text-[var(--admin-text-muted)]">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent Order"}
                        </span>
                        <span className="text-xs text-[var(--admin-text-subtle)]">•</span>
                        <span
                          className={`admin-badge ${
                            isPaid ? "admin-badge-paid" : "admin-badge-cod"
                          }`}
                        >
                          {isPaid ? "💳 Paid Online" : "💵 Cash on Delivery"}
                        </span>
                      </div>

                      {/* Current Status Badge */}
                      <div className="flex items-center gap-3">
                        <span className={`admin-badge ${getBadgeClass(order.status)}`}>
                          ● {order.status || "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Product Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Customer Info */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-subtle)] block">
                          Customer & Delivery
                        </span>
                        <p className="font-bold text-sm text-[var(--admin-text-main)]">
                          {order.name || "Guest Customer"}
                        </p>
                        <p className="text-[var(--admin-text-muted)] truncate">{order.email}</p>
                        <p className="text-[var(--admin-text-muted)] mt-1 line-clamp-2">
                          {order.address ? `📍 ${order.address}` : "Address not provided"}
                        </p>
                        {order.phone && (
                          <p className="text-[var(--admin-text-muted)]">📞 {order.phone}</p>
                        )}
                      </div>

                      {/* Ordered Products Preview */}
                      <div className="space-y-1.5 md:col-span-2 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-subtle)] block">
                          Items Ordered ({items.length})
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {items.slice(0, 4).map((p, idx) => {
                            const img =
                              p?.productimage?.[0] ||
                              p?.image ||
                              "https://via.placeholder.com/50?text=Item";
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-card-border-subtle)]"
                              >
                                <img
                                  src={img}
                                  alt={p?.title || "Item"}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                                <span className="font-semibold text-[var(--admin-text-main)] max-w-[120px] truncate text-[11px]">
                                  {p?.title || "Product"}
                                </span>
                                <span className="font-bold text-[var(--admin-accent)] text-[11px]">
                                  ₹{p?.price}
                                </span>
                              </div>
                            );
                          })}
                          {items.length > 4 && (
                            <span className="text-[11px] font-semibold text-[var(--admin-text-muted)]">
                              +{items.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Footer & Actions */}
                    <div className="pt-3 border-t border-[var(--admin-card-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--admin-text-muted)]">
                          Total Amount:
                        </span>
                        <span className="text-lg font-black text-[var(--admin-text-main)]">
                          ₹{orderTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Changer Select */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--admin-text-muted)] hidden sm:inline">
                            Status:
                          </span>
                          <select
                            value={(order.status || "Pending").toLowerCase()}
                            disabled={updatingId === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="admin-select text-xs py-1.5 pl-3 pr-8 font-bold"
                          >
                            <option value="pending">Pending</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* View Order Detail Button */}
                        <Link
                          to={`/order/${order._id}`}
                          state={{ order }}
                          className="admin-btn-secondary text-xs py-1.5 px-3"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Orders;
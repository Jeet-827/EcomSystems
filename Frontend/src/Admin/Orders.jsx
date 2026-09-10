import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_BASE_URL, API_BASE_URL } from "../config/api.config.js";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      setOrders(res.data.orders || res.data.Od || res.data.order || res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* Handle status update (pending / shipping / delivered) */
  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
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
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update order status");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      {/* Sidebar Nav */}
      <Nav />

      {/* Main Content */}
      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto bg-white">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Customer Orders
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage and track all customer orders
              </p>
            </div>
            <div>
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                Total Orders: {orders.length}
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading orders...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && orders.length === 0 && (
            <div className="text-center py-16 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-base font-bold text-slate-800">No orders found</p>
              <p className="text-xs text-slate-500 mt-1">Orders placed by customers will appear here.</p>
            </div>
          )}

          {/* Orders List */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = order.status?.toLowerCase();
                const isPaid = order.payment?.toLowerCase() === "paid";

                // Calculate total price of products in this order
                const totalAmount =
                  order.productid?.reduce((sum, p) => {
                    const price = parseFloat(p?.price) || 0;
                    return sum + price;
                  }, 0) || 0;

                const statusColor =
                  status === "pending"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : status === "shipping"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : status === "delivered"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-slate-100 text-slate-700 border-slate-300";

                const customerName =
                  order.userid?.name ||
                  (typeof order.userid === "string"
                    ? `${order.userid.slice(0, 12)}...`
                    : "N/A");

                return (
                  <div
                    key={order._id}
                    onClick={() =>
                      navigate(`/order/${order._id}`, { state: { order } })
                    }
                    className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer space-y-4"
                  >
                    {/* Card Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                          #{order._id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Status Select & Payment Pill */}
                      <div className="flex items-center gap-2">
                        <select
                          value={status || "pending"}
                          disabled={status === "delivered"}
                          onClick={(e) => e.stopPropagation()} // Prevent clicking the card to navigate
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${statusColor} ${
                            status === "delivered" ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                          }`}
                        >
                          <option value="pending" className="bg-white text-amber-700">Pending</option>
                          <option value="shipping" className="bg-white text-blue-700">Shipping</option>
                          <option value="delivered" className="bg-white text-emerald-700">Delivered</option>
                        </select>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          {order.payment || "UNPAID"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">
                          Customer:{" "}
                          <span className="text-slate-800 font-semibold">{customerName}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Phone:{" "}
                          <span className="text-slate-800 font-semibold">{order.phonenumber || "N/A"}</span>
                        </p>
                      </div>

                      {/* Product Thumbnails Preview */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium">
                          {order.productid?.length || 0} item(s)
                        </span>
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.productid?.slice(0, 3).map((prod, idx) => {
                            const img = Array.isArray(prod?.productimage)
                              ? prod.productimage[0]
                              : prod?.productimage;
                            return img ? (
                              <img
                                key={idx}
                                src={img}
                                alt={prod?.title || "product"}
                                className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover bg-slate-100"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                key={idx}
                                className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold"
                              >
                                📦
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Total & Action */}
                      <div className="flex items-center gap-3">
                        <span className="text-base font-extrabold text-emerald-600">
                          ₹{totalAmount}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
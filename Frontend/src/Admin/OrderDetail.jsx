import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ADMIN_API_BASE_URL, API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";

function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order && id) {
      const fetchOrderDetail = async () => {
        try {
          setLoading(true);
          let res;
          try {
            res = await axios.get(
              `${ADMIN_API_BASE_URL}/api/v1/order/singleorder/${id}`,
              { withCredentials: true }
            );
          } catch {
            res = await axios.get(
              `${API_BASE_URL}/api/v1/order/orderget/${id}`,
              { withCredentials: true }
            );
          }
          setOrder(res.data.order || res.data.data);
        } catch (err) {
          console.error("Error fetching order details:", err);
          setError("Failed to load order details. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetail();
    }
  }, [id, order]);

  // Subtotal calculation
  const subtotal =
    order?.productid?.reduce((sum, item) => {
      const price = parseFloat(item?.price) || 0;
      return sum + price;
    }, 0) || 0;

  const shippingFee = 0;
  const grandTotal = subtotal + shippingFee;
  const isPaid = (order?.payment || "").toLowerCase() === "paid";
  const currentStatus = (order?.status || "pending").toLowerCase();

  const statusSteps = ["pending", "shipping", "delivered"];
  const currentStepIndex = statusSteps.indexOf(currentStatus);

  return (
    <div className="admin-layout font-sans">
      <Nav />

      <main className="admin-main">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Breadcrumb & Print Toolbar */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--admin-card-border)]">
            <Link
              to="/order"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--admin-accent)] hover:underline transition-all"
            >
              <span>←</span> Back to All Orders
            </Link>

            <button
              onClick={() => window.print()}
              className="admin-btn-secondary text-xs py-1.5 px-3 print:hidden"
            >
              🖨️ Print Invoice
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="admin-card p-16 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                Loading order information...
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center justify-between">
              <span>{error}</span>
              <Link to="/order" className="underline font-bold">
                Return to Orders
              </Link>
            </div>
          )}

          {!loading && order && (
            <div className="space-y-6">
              
              {/* Header Card */}
              <div className="admin-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-subtle)]">
                      Order Reference
                    </span>
                    <span
                      className={`admin-badge ${
                        isPaid ? "admin-badge-paid" : "admin-badge-cod"
                      }`}
                    >
                      {isPaid ? "💳 Paid" : "💵 COD"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--admin-text-main)] font-mono mt-1">
                    #{order._id}
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                    Placed on{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-[var(--admin-text-muted)] block">
                    Total Amount
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[var(--admin-text-main)]">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Status Timeline Card */}
              <div className="admin-card p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-5">
                  Order Fulfillment Timeline
                </h3>

                <div className="flex items-center justify-between relative max-w-xl mx-auto px-4 sm:px-8">
                  {/* Connecting Line */}
                  <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-[var(--admin-card-border)] -z-0" />

                  {/* Pending Step */}
                  <div className="flex flex-col items-center relative z-10 space-y-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStepIndex >= 0
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                          : "bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] border border-[var(--admin-card-border)]"
                      }`}
                    >
                      ✓
                    </div>
                    <span className="text-[11px] font-bold text-[var(--admin-text-main)]">
                      Placed
                    </span>
                  </div>

                  {/* Shipping Step */}
                  <div className="flex flex-col items-center relative z-10 space-y-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStepIndex >= 1
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                          : "bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] border border-[var(--admin-card-border)]"
                      }`}
                    >
                      {currentStepIndex >= 1 ? "✓" : "2"}
                    </div>
                    <span className="text-[11px] font-bold text-[var(--admin-text-main)]">
                      Shipping
                    </span>
                  </div>

                  {/* Delivered Step */}
                  <div className="flex flex-col items-center relative z-10 space-y-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStepIndex >= 2
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                          : "bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] border border-[var(--admin-card-border)]"
                      }`}
                    >
                      {currentStepIndex >= 2 ? "✓" : "3"}
                    </div>
                    <span className="text-[11px] font-bold text-[var(--admin-text-main)]">
                      Delivered
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Shipping & Payment Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="admin-card p-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] pb-2 border-b border-[var(--admin-card-border-subtle)]">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[var(--admin-text-subtle)] block">Name</span>
                      <span className="font-bold text-[var(--admin-text-main)] text-sm">
                        {order.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--admin-text-subtle)] block">Email</span>
                      <span className="font-mono text-[var(--admin-text-main)]">
                        {order.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--admin-text-subtle)] block">Shipping Address</span>
                      <span className="text-[var(--admin-text-main)] font-medium">
                        {order.address || "Address not provided"}
                      </span>
                    </div>
                    {order.phone && (
                      <div>
                        <span className="text-[var(--admin-text-subtle)] block">Phone</span>
                        <span className="text-[var(--admin-text-main)] font-medium">
                          {order.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="admin-card p-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] pb-2 border-b border-[var(--admin-card-border-subtle)]">
                    Payment Summary
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--admin-text-muted)]">Payment Mode</span>
                      <span className="font-bold text-[var(--admin-text-main)] capitalize">
                        {order.payment || "Online"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--admin-text-muted)]">Subtotal ({order.productid?.length || 0} items)</span>
                      <span className="font-bold text-[var(--admin-text-main)]">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--admin-text-muted)]">Shipping Charges</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[var(--admin-card-border-subtle)] flex justify-between text-sm">
                      <span className="font-black text-[var(--admin-text-main)]">Grand Total</span>
                      <span className="font-black text-base text-[var(--admin-accent)]">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="admin-table-container">
                <div className="p-4 border-b border-[var(--admin-card-border)] bg-[var(--admin-card-header)]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Ordered Line Items
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Product ID</th>
                        <th className="text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.productid?.map((p, idx) => {
                        const img =
                          p?.productimage?.[0] ||
                          p?.image ||
                          "https://via.placeholder.com/60?text=Item";
                        return (
                          <tr key={idx}>
                            <td>
                              <div className="flex items-center gap-3">
                                <img
                                  src={img}
                                  alt={p?.title || "Item"}
                                  className="w-10 h-10 rounded-xl object-cover border border-[var(--admin-card-border)]"
                                />
                                <div>
                                  <p className="font-bold text-xs sm:text-sm text-[var(--admin-text-main)]">
                                    {p?.title || "Product Item"}
                                  </p>
                                  <p className="text-[11px] text-[var(--admin-text-muted)] line-clamp-1">
                                    {p?.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="admin-badge admin-badge-shipping text-[11px]">
                                {p?.category || "General"}
                              </span>
                            </td>
                            <td className="font-mono text-xs text-[var(--admin-text-muted)]">
                              {p?._id?.slice(-8) || "N/A"}
                            </td>
                            <td className="text-right font-black text-[var(--admin-text-main)]">
                              ₹{Number(p?.price || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default OrderDetail;

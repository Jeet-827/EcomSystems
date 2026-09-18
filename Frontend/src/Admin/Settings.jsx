import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Nav from "./Nav";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL, ADMIN_API_BASE_URL } from "../config/api.config.js";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  const [editproduct, setEditproduct] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchallproduct = useCallback(async () => {
    setLoadingProducts(true);
    try {
      let products = [];
      try {
        const res = await axios.get(`${ADMIN_API_BASE_URL}/api/v1/edit/editallproduct`);
        if (res.data?.data && Array.isArray(res.data.data)) {
          products = res.data.data;
        }
      } catch {
        // Fallback to backend API
      }

      if (!products || products.length === 0) {
        const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget?limit=0`);
        products = res.data?.products || res.data?.data || [];
      }

      setEditproduct(products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || "Product"}"?`)) return;
    setDeletingId(id);
    try {
      try {
        await axios.delete(`${ADMIN_API_BASE_URL}/api/v1/edit/deleteproduct/${id}`, {
          withCredentials: true,
        });
      } catch {
        await axios.delete(`${API_BASE_URL}/api/v1/product/deleteproduct/${id}`, {
          withCredentials: true,
        });
      }

      setEditproduct((prev) => prev.filter((item) => item._id !== id));
      toast.success(`"${title || "Product"}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const changepass = useCallback(
    async (e) => {
      e.preventDefault();
      setUpdatingPass(true);
      try {
        const res = await axios.post(
          `${ADMIN_API_BASE_URL}/api/v1/admin/updatepass`,
          { email: email.trim(), password, newpassword },
          { withCredentials: true }
        );
        toast.success(res.data.message || "Admin credentials updated successfully!");
        setEmail("");
        setPassword("");
        setNewpassword("");
      } catch (adminErr) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/v1/userdata/changepassword`,
            { email: email.trim(), password, newpassword }
          );
          toast.success(res.data.message || "Password updated successfully!");
          setEmail("");
          setPassword("");
          setNewpassword("");
        } catch (err) {
          toast.error(
            adminErr.response?.data?.message ||
              err.response?.data?.message ||
              "Failed to update password."
          );
        }
      } finally {
        setUpdatingPass(false);
      }
    },
    [email, password, newpassword]
  );

  useEffect(() => {
    fetchallproduct();
  }, [fetchallproduct]);

  const filteredProducts = editproduct.filter((item) =>
    item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout font-sans">
      <Nav />

      <main className="admin-main">
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
          
          {/* Header (Matching Screenshot) */}
          <div className="pb-5 border-b border-[var(--admin-card-border)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">⚙️</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight font-['Outfit']">
                Admin Settings & Security
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] mt-1.5 font-medium">
              Configure master credentials and manage inventory shortcuts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* ── Left Card: Update Admin Password (col-span-5) ── */}
            <div className="lg:col-span-5 admin-card p-6 sm:p-7 space-y-6 rounded-2xl sm:rounded-3xl shadow-md border border-[var(--admin-card-border)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--admin-text-main)] tracking-tight font-['Outfit']">
                  Update Admin Password
                </h3>
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  Change administrative account security key
                </p>
              </div>

              <form onSubmit={changepass} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                    ADMIN EMAIL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="admin-input text-sm py-2.5 px-3.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                    CURRENT PASSWORD <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="admin-input text-sm py-2.5 px-3.5 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] transition-colors cursor-pointer"
                      title={showCurrentPass ? "Hide password" : "Show password"}
                    >
                      {showCurrentPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                    NEW SECURE PASSWORD <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={newpassword}
                      onChange={(e) => setNewpassword(e.target.value)}
                      className="admin-input text-sm py-2.5 px-3.5 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] transition-colors cursor-pointer"
                      title={showNewPass ? "Hide password" : "Show password"}
                    >
                      {showNewPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updatingPass}
                    className="w-full admin-primary-btn py-3 text-sm font-bold tracking-wide"
                  >
                    {updatingPass ? "Updating Password..." : "Save New Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Right Card: Catalog Quick Actions (col-span-7) ── */}
            <div className="lg:col-span-7 admin-card p-6 sm:p-7 space-y-5 rounded-2xl sm:rounded-3xl shadow-md border border-[var(--admin-card-border)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h3 className="text-lg font-bold text-[var(--admin-text-main)] tracking-tight font-['Outfit']">
                    Catalog Quick Actions
                  </h3>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                    Quickly inspect, edit, or delete items ({editproduct.length} total)
                  </p>
                </div>

                <Link
                  to="/allproduct"
                  className="admin-catalog-outline-btn self-start sm:self-auto"
                >
                  Full Catalog View →
                </Link>
              </div>

              {/* Search Bar (Matching Screenshot) */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base text-[var(--admin-text-muted)]">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Filter catalog list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-input pl-10 text-xs sm:text-sm py-2.5"
                />
              </div>

              {/* Products List */}
              {loadingProducts ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-[#10b981] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-[var(--admin-text-muted)] font-medium">Loading items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-[var(--admin-bg-secondary)] rounded-2xl border border-[var(--admin-card-border-subtle)]">
                  <p className="text-sm font-semibold text-[var(--admin-text-muted)]">No matching products found.</p>
                  <p className="text-xs text-[var(--admin-text-subtle)] mt-1">Try refining your search keyword.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const img =
                      product.productimage?.[0] ||
                      product.image ||
                      "https://via.placeholder.com/60?text=Item";

                    return (
                      <div
                        key={product._id}
                        className="admin-product-row flex-wrap sm:flex-nowrap gap-3"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={img}
                            alt={product.title}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover flex-shrink-0 border border-[var(--admin-card-border)] bg-[var(--admin-bg)]"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/60?text=Item";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs sm:text-sm text-[var(--admin-text-main)] truncate font-['Outfit']">
                              {product.title}
                            </p>
                            <p className="text-[11px] sm:text-xs text-[var(--admin-text-muted)] mt-0.5 truncate">
                              ₹{Number(product.price || 0).toLocaleString("en-IN")} • {product.category || "General"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <Link
                            to={`/editproduct/${product._id}`}
                            className="admin-edit-pill"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.title)}
                            disabled={deletingId === product._id}
                            className="admin-delete-pill"
                          >
                            {deletingId === product._id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;


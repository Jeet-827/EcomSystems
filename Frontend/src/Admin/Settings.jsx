import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Nav from "./Nav";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL, ADMIN_API_BASE_URL } from "../config/api.config.js";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newpassword, setNewpassword] = useState("");
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
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Nav />

      <main className="admin-main">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="pb-6 border-b border-[var(--admin-card-border)]">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚙️</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight">
                Admin Settings & Security
              </h1>
            </div>
            <p className="text-sm text-[var(--admin-text-muted)] mt-1">
              Configure master credentials and manage inventory shortcuts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Password Update Card */}
            <div className="admin-card p-6 sm:p-7 space-y-5 h-fit">
              <div className="pb-3 border-b border-[var(--admin-card-border-subtle)]">
                <h3 className="text-base font-bold text-[var(--admin-text-main)]">
                  Update Admin Password
                </h3>
                <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                  Change administrative account security key
                </p>
              </div>

              <form onSubmit={changepass} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                    Admin Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="admin-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="admin-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                    New Secure Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newpassword}
                    onChange={(e) => setNewpassword(e.target.value)}
                    className="admin-input"
                    required
                    minLength={6}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updatingPass}
                    className="w-full admin-btn-primary py-2.5 shadow-sm"
                  >
                    {updatingPass ? "Updating Password..." : "Save New Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Catalog Manager */}
            <div className="lg:col-span-2 admin-card p-6 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--admin-card-border-subtle)]">
                <div>
                  <h3 className="text-base font-bold text-[var(--admin-text-main)]">
                    Catalog Quick Actions
                  </h3>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                    Quickly inspect, edit, or delete items ({editproduct.length} total)
                  </p>
                </div>

                <Link
                  to="/allproduct"
                  className="admin-btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
                >
                  Full Catalog View →
                </Link>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--admin-text-muted)]">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Filter catalog list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-input pl-9 text-xs"
                />
              </div>

              {/* Products List */}
              {loadingProducts ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[var(--admin-text-muted)]">Loading items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 bg-[var(--admin-bg-secondary)] rounded-xl border border-[var(--admin-card-border-subtle)]">
                  <p className="text-xs text-[var(--admin-text-muted)]">No matching products found.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const img =
                      product.productimage?.[0] ||
                      product.image ||
                      "https://via.placeholder.com/50?text=No+Img";

                    return (
                      <div
                        key={product._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-card-border-subtle)] hover:border-[var(--admin-accent)] transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={img}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs sm:text-sm text-[var(--admin-text-main)] truncate">
                              {product.title}
                            </p>
                            <p className="text-[11px] text-[var(--admin-text-muted)]">
                              ₹{Number(product.price || 0).toLocaleString("en-IN")} • {product.category || "General"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <Link
                            to={`/editproduct/${product._id}`}
                            className="admin-btn-secondary text-xs py-1 px-2.5"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.title)}
                            disabled={deletingId === product._id}
                            className="admin-btn-danger text-xs py-1 px-2.5"
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

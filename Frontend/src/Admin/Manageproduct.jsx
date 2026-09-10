import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL, ADMIN_API_BASE_URL } from "../config/api.config.js";
import { Link, useNavigate } from "react-router-dom";
import Nav from "./Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Manageproduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  /* Fetch all products from Admin API with backend fallback */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let list = [];
      try {
        const res = await axios.get(`${ADMIN_API_BASE_URL}/api/v1/edit/editallproduct`);
        if (res.data?.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        }
      } catch {
        // Fallback to main backend product endpoint
      }

      if (!list || list.length === 0) {
        const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget?limit=0`);
        list = res.data?.products || res.data?.data || [];
      }

      setProducts(list);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to load products catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* Open delete confirmation */
  const confirmDelete = (product) => {
    setDeleteModal({ open: true, product });
  };

  /* Execute delete */
  const handleDelete = async () => {
    if (!deleteModal.product) return;
    const { _id, title } = deleteModal.product;
    setIsDeleting(true);

    try {
      try {
        await axios.delete(`${ADMIN_API_BASE_URL}/api/v1/edit/deleteproduct/${_id}`, {
          withCredentials: true,
        });
      } catch {
        await axios.delete(`${API_BASE_URL}/api/v1/product/deleteproduct/${_id}`, {
          withCredentials: true,
        });
      }
      toast.success(`"${title || "Product"}" deleted successfully!`);
      setProducts((prev) => prev.filter((p) => p._id !== _id));
      setDeleteModal({ open: false, product: null });
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  /* Dynamic list of unique categories */
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products]);

  /* Filtered products based on search & category */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (p.title || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);
      const matchesCat =
        selectedCategory === "all" ||
        (p.category || "").toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  /* Summary Metrics */
  const metrics = useMemo(() => {
    const totalCount = products.length;
    const totalCategories = categories.length;
    const catalogValue = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
    return { totalCount, totalCategories, catalogValue };
  }, [products, categories]);

  return (
    <div className="admin-layout font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      {/* Sidebar Navigation */}
      <Nav />

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--admin-card-border)]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📦</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight">
                  Product Catalog
                </h1>
              </div>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                Browse, search, edit, and organize all active inventory items.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProducts}
                className="admin-btn-secondary text-xs sm:text-sm py-2 px-3.5"
                title="Refresh product list"
              >
                🔄 Refresh
              </button>
              <Link
                to="/dashboard"
                className="admin-btn-primary text-xs sm:text-sm py-2 px-4 shadow-sm"
              >
                <span>➕</span> Add Product
              </Link>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                🛍️
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Total Products
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5">
                  {metrics.totalCount}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                🏷️
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Categories
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5">
                  {metrics.totalCategories}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
                💰
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Inventory Value
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5">
                  ₹{metrics.catalogValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Filter, Search & View Toolbar */}
          <div className="admin-card p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Live Search Input */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--admin-text-muted)] text-base">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by product title, category, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="admin-input pl-10"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] cursor-pointer"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* View Mode Toggle Button */}
              <div className="flex items-center gap-1.5 self-end md:self-auto bg-[var(--admin-bg-secondary)] p-1 rounded-xl border border-[var(--admin-card-border)]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[var(--admin-card-bg)] text-[var(--admin-accent)] shadow-xs"
                      : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                  }`}
                >
                  ▦ Grid
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-[var(--admin-card-bg)] text-[var(--admin-accent)] shadow-xs"
                      : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                  }`}
                >
                  ☰ Table
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[var(--admin-text-muted)] font-semibold flex-shrink-0">
                Category:
              </span>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                }`}
              >
                All ({products.length})
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content States: Loading, Empty, Grid, Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 admin-card">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                Loading products catalog...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--admin-bg-secondary)] flex items-center justify-center text-3xl mx-auto">
                📦
              </div>
              <h3 className="text-lg font-bold text-[var(--admin-text-main)]">
                No products found
              </h3>
              <p className="text-sm text-[var(--admin-text-muted)] max-w-sm mx-auto">
                {search || selectedCategory !== "all"
                  ? "Try adjusting your search keywords or switching category filters."
                  : "Your product catalog is empty. Start by adding your first product."}
              </p>
              {(search || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                  }}
                  className="admin-btn-secondary text-xs"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* ── Grid View ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const imgUrl =
                  product.productimage?.[0] ||
                  product.image ||
                  product.thumbnail ||
                  "https://via.placeholder.com/300?text=No+Image";

                return (
                  <div
                    key={product._id}
                    className="admin-card admin-card-hover overflow-hidden flex flex-col group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full bg-[var(--admin-bg-secondary)] overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300?text=Image+Unavailable";
                        }}
                      />
                      {product.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-black/70 backdrop-blur-xs text-white border border-white/20 shadow-xs">
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-[var(--admin-text-main)] line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {product.title}
                        </h4>
                        <p className="text-xs text-[var(--admin-text-muted)] line-clamp-2 mt-1">
                          {product.description || "No description provided."}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--admin-card-border-subtle)] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--admin-text-subtle)] block">
                            Price
                          </span>
                          <span className="text-base font-black text-[var(--admin-text-main)]">
                            ₹{Number(product.price || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/editproduct/${product._id}`}
                            className="p-2 rounded-xl bg-[var(--admin-bg-secondary)] hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 text-[var(--admin-text-main)] transition-colors text-sm"
                            title="Edit Product"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => confirmDelete(product)}
                            className="p-2 rounded-xl bg-[var(--admin-bg-secondary)] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-[var(--admin-text-muted)] transition-colors text-sm cursor-pointer"
                            title="Delete Product"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Table View ── */
            <div className="admin-table-container">
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Product ID</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const imgUrl =
                        product.productimage?.[0] ||
                        product.image ||
                        "https://via.placeholder.com/80?text=No+Img";

                      return (
                        <tr key={product._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <img
                                src={imgUrl}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded-xl border border-[var(--admin-card-border)]"
                              />
                              <div>
                                <p className="font-bold text-xs sm:text-sm text-[var(--admin-text-main)] line-clamp-1">
                                  {product.title}
                                </p>
                                <p className="text-[11px] text-[var(--admin-text-muted)] line-clamp-1">
                                  {product.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-shipping text-[11px]">
                              {product.category || "General"}
                            </span>
                          </td>
                          <td className="font-black text-[var(--admin-text-main)]">
                            ₹{Number(product.price || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="font-mono text-xs text-[var(--admin-text-muted)]">
                            {product._id?.slice(-8)}
                          </td>
                          <td className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                to={`/editproduct/${product._id}`}
                                className="admin-btn-secondary text-xs py-1.5 px-3"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => confirmDelete(product)}
                                className="admin-btn-danger text-xs py-1.5 px-3"
                              >
                                Delete
                              </button>
                            </div>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="admin-card p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[var(--admin-text-main)]">
                Delete Product?
              </h3>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-[var(--admin-text-main)]">
                  "{deleteModal.product?.title}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, product: null })}
                disabled={isDeleting}
                className="admin-btn-secondary text-xs sm:text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="admin-btn-danger text-xs sm:text-sm py-2 px-5"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manageproduct;
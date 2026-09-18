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
      
      {/* Sidebar & Navigation */}
      <Nav />

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--admin-card-border)]">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">📦</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight font-['Outfit']">
                  Products Catalog
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] mt-1.5 font-medium">
                Browse, search, edit, and organize all active inventory items with real-time sync.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProducts}
                className="admin-btn-secondary text-xs sm:text-sm"
                title="Refresh product list"
              >
                <span>🔄</span> Refresh
              </button>
              <Link
                to="/dashboard"
                className="admin-primary-btn text-xs sm:text-sm py-2 px-4"
              >
                <span>➕</span> Add New Product
              </Link>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl font-bold border border-emerald-500/30 shrink-0">
                🛍️
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Total Products
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5 font-['Outfit']">
                  {metrics.totalCount}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center text-xl font-bold border border-cyan-500/30 shrink-0">
                🏷️
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Active Categories
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5 font-['Outfit']">
                  {metrics.totalCategories}
                </p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl font-bold border border-amber-500/30 shrink-0">
                💰
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Catalog Inventory Value
                </p>
                <p className="text-2xl font-black text-[var(--admin-text-main)] mt-0.5 font-['Outfit']">
                  ₹{metrics.catalogValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Search, Filter & View Controls Bar */}
          <div className="admin-card p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Live Search Input */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--admin-text-muted)] text-base">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search products by title, category, keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="admin-input pl-10 pr-20 text-sm"
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

              {/* View Mode Switcher (Grid / Table) */}
              <div className="flex items-center gap-1.5 self-end md:self-auto bg-[var(--admin-bg)] p-1 rounded-xl border border-[var(--admin-card-border)]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#10b981] text-black font-black shadow-sm"
                      : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                  }`}
                >
                  ▦ Grid View
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-[#10b981] text-black font-black shadow-sm"
                      : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                  }`}
                >
                  ☰ Table View
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[var(--admin-text-muted)] font-semibold flex-shrink-0">
                Filter:
              </span>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#10b981] text-black shadow-sm font-black"
                    : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] border border-[var(--admin-card-border)]"
                }`}
              >
                +All ({products.length})
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer capitalize ${
                      isActive
                        ? "bg-[#10b981] text-black shadow-sm font-black"
                        : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] border border-[var(--admin-card-border)]"
                    }`}
                  >
                    +{cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content States: Loading, Empty, 3D Grid, Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 admin-card">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-[#10b981] rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                Loading products catalog...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--admin-bg)] border border-[var(--admin-card-border)] flex items-center justify-center text-3xl mx-auto">
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
                  className="admin-btn-secondary text-xs font-bold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* ── Product Grid View ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const imgUrl =
                  product.productimage?.[0] ||
                  product.image ||
                  product.thumbnail ||
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";

                return (
                  <div
                    key={product._id}
                    className="admin-card p-4 sm:p-5 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-emerald-500/50"
                  >
                    <div>
                      {/* Product Image Stage */}
                      <div className="relative aspect-square w-full rounded-xl bg-[var(--admin-bg)] flex items-center justify-center p-4 mb-4 border border-[var(--admin-card-border)] overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>

                      {/* Price & Stock Badge Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xl sm:text-2xl font-black text-[var(--admin-text-main)] font-['Outfit'] tracking-tight">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          {product.stock ? `${product.stock} in stock` : "In Stock"}
                        </span>
                      </div>

                      {/* Product Title */}
                      <h4 className="font-bold text-sm text-[var(--admin-text-main)] line-clamp-1 group-hover:text-emerald-500 transition-colors mt-2">
                        {product.title}
                      </h4>
                      {product.description && (
                        <p className="text-xs text-[var(--admin-text-muted)] line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Category Pill & Action Buttons */}
                    <div className="pt-3 mt-3 border-t border-[var(--admin-card-border-subtle)] flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--admin-bg)] border border-[var(--admin-card-border)] text-[var(--admin-text-secondary)] capitalize">
                        +{product.category || "General"}
                      </span>

                      {/* Action Icons: Edit & Delete */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/editproduct/${product._id}`}
                          className="admin-edit-pill text-xs"
                          title="Edit Product"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="admin-delete-pill text-xs"
                          title="Delete Product"
                        >
                          Delete
                        </button>
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
                      <th>Stock</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const imgUrl =
                        product.productimage?.[0] ||
                        product.image ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80";

                      return (
                        <tr key={product._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <img
                                src={imgUrl}
                                alt={product.title}
                                className="w-11 h-11 object-contain rounded-xl bg-[var(--admin-bg)] p-1 border border-[var(--admin-card-border)]"
                              />
                              <div>
                                <p className="font-bold text-sm text-[var(--admin-text-main)] line-clamp-1">
                                  {product.title}
                                </p>
                                <p className="text-xs text-[var(--admin-text-muted)] line-clamp-1">
                                  {product.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--admin-bg)] border border-[var(--admin-card-border)] text-[var(--admin-text-secondary)] capitalize">
                              +{product.category || "General"}
                            </span>
                          </td>
                          <td className="font-black text-[var(--admin-text-main)] font-['Outfit']">
                            ₹{Number(product.price || 0).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                              {product.stock ? `${product.stock} units` : "In Stock"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="inline-flex items-center gap-2">
                              <Link
                                to={`/editproduct/${product._id}`}
                                className="admin-edit-pill text-xs"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => confirmDelete(product)}
                                className="admin-delete-pill text-xs"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="admin-card p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto border border-rose-500/20">
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
                className="admin-btn-secondary text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="admin-delete-pill text-xs sm:text-sm py-2 px-5"
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
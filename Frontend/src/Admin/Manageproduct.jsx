import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL, ADMIN_API_BASE_URL } from "../config/api.config.js";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Manageproduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  /* Fetch all products from store */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget?limit=100`);
      setProducts(res.data.products || []);
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

  /* Handle product deletion */
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      try {
        await axios.delete(`${ADMIN_API_BASE_URL}/api/v1/edit/delete/${id}`, {
          withCredentials: true,
        });
      } catch {
        await axios.delete(`${API_BASE_URL}/api/v1/product/deleteproduct/${id}`, {
          withCredentials: true,
        });
      }
      toast.success(`"${title}" deleted successfully!`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  /* Filter categories list */
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  /* Filtered products */
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      {/* Sidebar Navigation */}
      <Nav />

      {/* Main Content */}
      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto bg-white">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Product Catalog Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                View, search, edit, and manage all products in the store.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              <span>➕</span>
              <span>Add New Product</span>
            </Link>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search products by title, category, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading catalog...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16 px-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <p className="text-3xl">📦</p>
              <p className="text-base font-bold text-slate-800">No products found</p>
              <p className="text-xs text-slate-500">
                {search || selectedCategory !== "all"
                  ? "Try clearing your search filters."
                  : "Start by adding your first product to the catalog!"}
              </p>
            </div>
          )}

          {/* Product Grid */}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const imgSrc = Array.isArray(product.productimage)
                  ? product.productimage[0]
                  : product.productimage;

                return (
                  <div
                    key={product._id}
                    className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                          📦
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
                        {product.category || "General"}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-slate-900">
                          ₹{product.price}
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/editproduct/${product._id}`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            disabled={deletingId === product._id}
                            onClick={() => handleDelete(product._id, product.title)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === product._id ? "Deleting..." : "🗑️ Delete"}
                          </button>
                        </div>
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

export default Manageproduct;
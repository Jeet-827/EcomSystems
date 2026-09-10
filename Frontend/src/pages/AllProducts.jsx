import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useUser } from "../store/Usercontext";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CATEGORIES = [
  { id: "all", label: "All Products", icon: "🌐" },
  { id: "mobile", label: "Mobile", icon: "📱" },
  { id: "watch", label: "Watch", icon: "⌚" },
  { id: "shoes", label: "Shoes", icon: "👟" },
  { id: "makeup", label: "Makeup", icon: "💄" },
  { id: "fashion", label: "Fashion", icon: "👗" },
  { id: "beauty", label: "Beauty", icon: "💇‍♀️" },
];

const CATEGORY_ICON_MAP = {
  mobile: "📱",
  phone: "📱",
  watch: "⌚",
  shoes: "👟",
  makeup: "💄",
  fashion: "👗",
  beauty: "💇‍♀️",
  pc: "💻",
  default: "📦",
};

const ITEMS_PER_PAGE = 12;

/* ─────────────────── Memoised Product Card ─────────────────── */
const ProductCard = memo(({ elem, onAddToCart, onProductClick }) => {
  const imgSrc = Array.isArray(elem.productimage)
    ? elem.productimage[0]
    : elem.productimage;
  const catKey = elem.category?.toLowerCase() || "";
  const icon = CATEGORY_ICON_MAP[catKey] || CATEGORY_ICON_MAP.default;

  return (
    <div
      onClick={() => onProductClick(elem._id)}
      className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
    >
      {/* Product Image Container */}
      <div className="relative w-full h-48 sm:h-56 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {imgSrc ? (
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={imgSrc}
            alt={elem.title}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl text-slate-300 bg-slate-50"
          style={{ display: imgSrc ? "none" : "flex" }}
        >
          {icon}
        </div>

        {/* Category Pill */}
        {elem.category && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md border border-slate-200 text-indigo-700 shadow-sm pointer-events-none">
            {elem.category}
          </span>
        )}
      </div>

      {/* Product Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <h2
            className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors"
            title={elem.title}
          >
            {elem.title}
          </h2>
          <p
            className="text-xs text-slate-500 line-clamp-2 leading-relaxed"
            title={elem.description}
          >
            {elem.description || "High quality product with premium finish and durable build."}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 whitespace-nowrap">
              ₹{Number(elem.price).toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(elem);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-200 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <span>🛒</span>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
});

/* ─────────────────── Pagination Controls ─────────────────── */
const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-6 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        ← Previous
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
            currentPage === p
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        Next →
      </button>
    </div>
  );
});

function Allproducts() {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [selectedcategory, setSelectedcategory] = useState("all");
  const [filterproduct, setFilterproduct] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const { token, setCartitem } = useUser();
  const navigate = useNavigate();

  /* ─────────────────── Fetch Products from API ─────────────────── */
  const fetchProducts = useCallback(async (page = 1, category = selectedcategory, search = filterproduct) => {
    try {
      if (page === 1) setLoading(true);
      else setPageLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/v1/product/productget?page=${page}&limit=${ITEMS_PER_PAGE}&category=${category}&search=${search}`
      );

      setProduct(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalProducts(res.data.totalProducts || (res.data.products || []).length);
      setCurrentPage(res.data.currentPage || page);
    } catch (error) {
      console.log("Error loading products:", error);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [selectedcategory, filterproduct]);

  useEffect(() => {
    fetchProducts(1, selectedcategory, filterproduct);
  }, [selectedcategory, filterproduct, fetchProducts]);

  /* Page Change Handler */
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);
      fetchProducts(newPage, selectedcategory, filterproduct);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages, fetchProducts, selectedcategory, filterproduct]
  );

  /* Category Change Handler */
  const handleCategoryChange = useCallback((catId) => {
    setSelectedcategory(catId);
    setCurrentPage(1);
  }, []);

  /* Search Input Handler */
  const handleSearchChange = useCallback((e) => {
    setFilterproduct(e.target.value);
    setCurrentPage(1);
  }, []);

  /* Product Click Handler */
  const handleProductClick = useCallback((id) => {
    navigate(`/product/${id}`);
  }, [navigate]);

  /* Add to Cart Handler */
  const handleAddToCart = useCallback(
    async (elem) => {
      if (!token) {
        toast.info("Please login to add items to cart!");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }
      try {
        const payload = {
          itemimage: elem.productimage,
          productid: elem._id,
          producttitle: elem.title,
          productprice: elem.price,
          productdescription: elem.description,
        };
        await axios.post(
          `${API_BASE_URL}/api/v1/cartdata/cartitem`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Added to Cart! 🛒", { autoClose: 900 });
        const cartRes = await axios.get(
          `${API_BASE_URL}/api/v1/cartdata/cartget`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartitem(cartRes.data.cart || cartRes.data.card || []);
      } catch (err) {
        toast.error("Failed to add to cart");
      }
    },
    [token, navigate, setCartitem]
  );

  const filteredProducts = useMemo(() => product, [product]);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <ToastContainer position="top-right" autoClose={2500} theme="light" />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm">
            <span>✨</span>
            <span>STORE CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            All Products Catalog
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Explore our curated collection of premium products with instant doorstep delivery.
          </p>
          <div className="pt-1">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
              Showing page <strong className="text-indigo-600">{currentPage}</strong> of <strong className="text-indigo-600">{totalPages}</strong> • <strong className="text-slate-900">{totalProducts}</strong> total items
            </span>
          </div>
        </div>

        {/* Filter Controls (Search + Categories) */}
        <div className="max-w-3xl mx-auto space-y-5 mb-10">
          {/* Search Input Bar */}
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search products by title, category, or keyword..."
              value={filterproduct}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
            />
            {filterproduct && (
              <button
                onClick={() => setFilterproduct("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedcategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                      : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid Content */}
        {loading || pageLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-slate-500 text-sm font-medium">Fetching catalog products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-50 border border-slate-200 rounded-3xl max-w-md mx-auto space-y-3">
            <div className="text-5xl">📦</div>
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500">
              No matches found for your current search or category filter. Try clearing filters!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((elem) => (
                <ProductCard
                  key={elem._id}
                  elem={elem}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Allproducts;

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useUser } from "../store/Usercontext";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  return (
    <div
      onClick={() => onProductClick(elem._id)}
      className="group card-aura-dark overflow-hidden flex flex-col justify-between cursor-pointer h-full border border-white/10 rounded-2xl sm:rounded-[28px] bg-[#1e1e1e] hover:border-emerald-500/50 transition-all duration-300 shadow-xl"
    >
      {/* Product Image Container */}
      <div className="relative w-full h-40 sm:h-60 bg-[#141414] overflow-hidden flex-shrink-0 flex items-center justify-center p-3.5 sm:p-5 rounded-t-2xl sm:rounded-t-[28px]">
        {imgSrc ? (
          <img
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
            src={imgSrc}
            alt={elem.title}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl text-slate-700">📦</div>
        )}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className="badge-bestseller-emerald shadow-md text-[8px] sm:text-[9.5px]">
            BESTSELLER
          </span>
        </div>
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span className="badge-limited-white shadow-md text-[8px] sm:text-[9.5px] hidden sm:inline-block">
            LIMITED EDITION
          </span>
        </div>
      </div>

      {/* Product Details Body */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3">
        <div>
          <h2
            className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors font-['Outfit']"
            title={elem.title}
          >
            {elem.title}
          </h2>
          <div className="flex items-center justify-between mt-1 gap-1">
            <p className="text-sm sm:text-base font-black text-white font-['Outfit']">
              ₹{Number(elem.price).toLocaleString()}
            </p>
            {elem.category && (
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-slate-300 line-clamp-1">
                {elem.category}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(elem);
          }}
          className="w-full py-2 sm:py-3 btn-emerald-lux text-[11px] sm:text-xs font-bold rounded-xl sm:rounded-2xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-1 mt-1"
        >
          <span>ADD TO BAG</span>
          <span className="text-xs sm:text-sm">🛍️</span>
        </button>
      </div>
    </div>
  );
});

/* ─────────────────── Pagination Controls ─────────────────── */
const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        ← Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
            page === currentPage
              ? "bg-[#10b981] text-white shadow-md shadow-[#10b981]/30 scale-105"
              : "bg-[#1e1e1e] border border-white/10 text-zinc-300 hover:bg-white/10"
          }`}
        >
          {page}
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
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "all";

  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [selectedcategory, setSelectedcategory] = useState(urlCategory);
  const [filterproduct, setFilterproduct] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const { token, setCartitem } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlCategory) {
      setSelectedcategory(urlCategory);
    }
  }, [urlCategory]);

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
    <div className="bg-[#121212] text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-[#10b981] border border-white/10">
            <span>✨</span>
            <span>STORE CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-widest font-['Outfit'] uppercase">
            All Products Catalog
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest leading-relaxed">
            Explore our curated collection of premium products with instant doorstep delivery.
          </p>
          <div className="pt-1">
            <span className="inline-block px-3 py-1 bg-[#1e1e1e] border border-white/10 text-zinc-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Showing page <strong className="text-[#10b981]">{currentPage}</strong> of <strong className="text-[#10b981]">{totalPages}</strong> • <strong className="text-white">{totalProducts}</strong> total items
            </span>
          </div>
        </div>

        {/* Filter Controls (Search + Categories) */}
        <div className="max-w-3xl mx-auto space-y-5 mb-10">
          {/* Search Input Bar */}
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-base pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search products by title, category, or keyword..."
              value={filterproduct}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-10 py-3 bg-[#1e1e1e] border border-white/10 rounded-2xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#10b981] shadow-sm transition-all"
            />
            {filterproduct && (
              <button
                onClick={() => setFilterproduct("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible">
            {CATEGORIES.map((cat) => {
              const isActive = selectedcategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 sm:flex-shrink ${
                    isActive
                      ? "bg-[#10b981] text-white shadow-lg scale-105"
                      : "bg-[#1e1e1e] border border-white/10 text-zinc-400 hover:bg-[#181818] hover:text-white"
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
            <div className="w-10 h-10 border-4 border-white/20 border-t-[#10b981] rounded-full animate-spin" />
            <span className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Fetching catalog products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-[#1e1e1e] border border-white/10 rounded-3xl max-w-md mx-auto space-y-3">
            <div className="text-5xl text-zinc-600">📦</div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">No products found</h3>
            <p className="text-xs text-zinc-400 uppercase tracking-widest">
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

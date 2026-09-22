import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useUser } from "../store/Usercontext";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaThLarge,
  FaList,
  FaFilter,
  FaChevronRight,
} from "react-icons/fa";

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "mobile", label: "Smartphones & Tablets" },
  { id: "laptop", label: "Laptops & PC Gaming" },
  { id: "audio", label: "Headphones & Speakers" },
  { id: "watch", label: "Smart Watches & Wearables" },
  { id: "camera", label: "Cameras & Drones" },
  { id: "gaming", label: "Gaming & VR" },
  { id: "tv", label: "TV & Smart Displays" },
  { id: "appliances", label: "Home & Kitchen Appliances" },
];

const ITEMS_PER_PAGE = 12;

/* ── Product Card Component ── */
const ProductCard = memo(({ elem, onAddToCart, onProductClick, viewMode = "grid" }) => {
  const { isInWishlist, toggleWishlist } = useUser();
  const isWishlisted = isInWishlist(elem._id);

  const imgSrc = Array.isArray(elem.productimage)
    ? elem.productimage[0]
    : elem.productimage || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onProductClick(elem._id)}
        className="card-tech p-4 flex flex-col sm:flex-row items-center gap-5 cursor-pointer bg-white border border-slate-200 hover:border-indigo-300"
      >
        <div className="w-full sm:w-48 h-40 bg-slate-50 rounded-xl flex items-center justify-center p-3 flex-shrink-0">
          <img
            src={imgSrc}
            alt={elem.title}
            className="w-full h-full object-contain hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex-1 space-y-2 text-left w-full">
          <span className="badge-category">{elem.category || "Gadget"}</span>
          <h3 className="text-base font-bold text-slate-900 font-['Outfit'] hover:text-[#4f46e5] transition-colors">
            {elem.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2">
            {elem.description || "High-performance tech hardware built with premium components."}
          </p>
          <div className="flex items-center gap-1 text-amber-400 text-xs">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            <span className="text-slate-400 text-[10px] ml-1">(4.9)</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-black text-slate-900 font-['Outfit']">
              ₹{Number(elem.price).toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const added = toggleWishlist(elem);
                  if (added) toast.success("Added to Wishlist! ❤️", { autoClose: 800 });
                  else toast.info("Removed from Wishlist", { autoClose: 700 });
                }}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isWishlisted ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50"
                }`}
              >
                <FaHeart size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(elem);
                }}
                className="px-5 py-2.5 btn-purple-primary text-xs font-bold gap-2"
              >
                <span>Add to Bag</span>
                <FaShoppingCart size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onProductClick(elem._id)}
      className="group card-tech flex flex-col justify-between cursor-pointer h-full bg-white border border-slate-200 hover:border-indigo-300 transition-all duration-300 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="badge-featured">IN STOCK</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const added = toggleWishlist(elem);
            if (added) {
              toast.success("Added to Wishlist! ❤️", { autoClose: 800 });
            } else {
              toast.info("Removed from Wishlist", { autoClose: 700 });
            }
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isWishlisted
              ? "text-rose-500 hover:text-rose-600 bg-rose-50"
              : "text-slate-300 hover:text-rose-500 hover:bg-slate-50"
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FaHeart size={14} />
        </button>
      </div>

      <div className="relative w-full h-44 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3">
        <img
          src={imgSrc}
          alt={elem.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {elem.category || "Electronics"}
          </span>
          <h2
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#4f46e5] transition-colors font-['Outfit']"
            title={elem.title}
          >
            {elem.title}
          </h2>
        </div>

        <div className="flex items-center gap-1 text-amber-400 text-xs">
          <FaStar size={11} /><FaStar size={11} /><FaStar size={11} /><FaStar size={11} /><FaStar size={11} />
          <span className="text-[10px] text-slate-400 font-semibold ml-1">(4.9)</span>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
          <span className="text-base font-black text-slate-900 font-['Outfit']">
            ₹{Number(elem.price).toLocaleString()}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(elem);
            }}
            className="px-3.5 py-2 btn-purple-primary text-xs font-bold gap-1"
          >
            <span>Add</span>
            <FaShoppingCart size={11} />
          </button>
        </div>
      </div>
    </div>
  );
});

function Allproducts() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState(250000);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  const { token, setCartitem } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat.toLowerCase());
      setCurrentPage(1);
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget?all=true`);
      setProducts(res.data.products || res.data.Products || []);
    } catch {
      // Fallback demo items
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!token) {
        toast.info("Please sign in to add items to cart!");
        setTimeout(() => navigate("/login"), 800);
        return;
      }
      try {
        const payload = {
          itemimage: product.productimage,
          productid: product._id,
          producttitle: product.title,
          productprice: product.price,
          productdescription: product.description,
        };
        await axios.post(`${API_BASE_URL}/api/v1/cartdata/cartitem`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Added to Bag! 🛍️", { autoClose: 900 });
        const cartRes = await axios.get(`${API_BASE_URL}/api/v1/cartdata/cartget`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartitem(cartRes.data.cart || []);
      } catch {
        toast.error("Failed to add to bag.");
      }
    },
    [token, navigate, setCartitem]
  );

  const handleProductClick = useCallback(
    (id) => {
      navigate(`/product/${id}`);
    },
    [navigate]
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory && selectedCategory !== "all") {
          const pCat = (p.category || "").toLowerCase();
          const selCat = selectedCategory.toLowerCase();
          if (selCat === "deals") {
            return true;
          }
          const matches =
            pCat === selCat ||
            pCat.includes(selCat) ||
            selCat.includes(pCat) ||
            (selCat === "mobile" && (pCat.includes("phone") || pCat.includes("tablet"))) ||
            (selCat === "laptop" && (pCat.includes("pc") || pCat.includes("computer"))) ||
            (selCat === "tv" && (pCat.includes("display") || pCat.includes("screen"))) ||
            (selCat === "appliances" && (pCat.includes("kitchen") || pCat.includes("home")));
          if (!matches) return false;
        }
        if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (p.price && Number(p.price) > priceRange) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === "price-high") return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === "name-az") return (a.title || "").localeCompare(b.title || "");
        return 0;
      });
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
      <Navbar />

      {/* Breadcrumb & Title */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span onClick={() => navigate("/")} className="hover:text-[#4f46e5] cursor-pointer">
                Home
              </span>
              <FaChevronRight size={8} />
              <span className="text-slate-800 font-bold">Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              Shop Tech Products
            </h1>
          </div>

          {/* Search in page */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search in catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5]"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Sidebar Filter (Figma style) ── */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit'] flex items-center justify-between">
                <span>Categories</span>
                <FaFilter size={12} className="text-[#4f46e5]" />
              </h3>

              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#4f46e5] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-[10px] opacity-75">›</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit']">
                Max Price
              </h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="500"
                  max="250000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#4f46e5] cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>₹500</span>
                  <span className="text-[#4f46e5]">₹{priceRange.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Right Products Grid ── */}
          <main className="lg:col-span-9 space-y-6">
            {/* Controls Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-500">
                Showing <strong className="text-slate-900">{displayedProducts.length}</strong> of{" "}
                <strong className="text-slate-900">{filteredProducts.length}</strong> results
              </span>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products by"
                    className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-az">Name: A to Z</option>
                  </select>
                </div>

                {/* Grid / List toggle */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid" ? "bg-white text-[#4f46e5] shadow-xs" : "text-slate-400"
                    }`}
                    title="Grid View"
                  >
                    <FaThLarge size={13} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list" ? "bg-white text-[#4f46e5] shadow-xs" : "text-slate-400"
                    }`}
                    title="List View"
                  >
                    <FaList size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="spinner-purple" />
                <p className="text-slate-400 text-xs font-bold uppercase">Loading products...</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
                <div className="text-5xl">🔍</div>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No products match your filters</h3>
                <p className="text-xs text-slate-500">Try resetting your category or price range filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange(250000);
                    setSearchQuery("");
                  }}
                  className="px-6 py-2.5 btn-purple-primary text-xs font-bold uppercase mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 gap-5"
                    : "space-y-4"
                }
              >
                {displayedProducts.map((p) => (
                  <ProductCard
                    key={p._id}
                    elem={p}
                    onAddToCart={handleAddToCart}
                    onProductClick={handleProductClick}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-[#4f46e5] text-white shadow-md"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Allproducts;

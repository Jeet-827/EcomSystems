import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "../store/Usercontext";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CATEGORY_ICON_MAP = {
  mobile: "📱",
  phone: "📱",
  watch: "⌚",
  shoes: "👟",
  makeup: "💄",
  fashion: "👗",
  beauty: "💇‍♀️",
  pc: "💻",
  default: "🛒",
};

/* ── Memoised search result card ── */
const SearchCard = memo(({ elem, onAddToCart, onProductClick }) => {
  const imgSrc = Array.isArray(elem.productimage)
    ? elem.productimage[0]
    : elem.productimage;
  const catKey = elem.category?.toLowerCase() || "";
  const icon = CATEGORY_ICON_MAP[catKey] || CATEGORY_ICON_MAP.default;

  return (
    <div
      onClick={() => onProductClick(elem._id)}
      className="group card-aura-dark overflow-hidden flex flex-col justify-between cursor-pointer h-full border border-white/10 rounded-2xl sm:rounded-[28px] bg-[#1e1e1e] hover:border-emerald-500/50 transition-all duration-300 shadow-xl"
    >
      <div className="relative w-full h-40 sm:h-56 bg-[#141414] overflow-hidden flex-shrink-0 flex items-center justify-center p-3.5 sm:p-5 rounded-t-2xl sm:rounded-t-[28px]">
        {imgSrc ? (
          <img
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
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
          className="w-full h-full flex items-center justify-center text-3xl sm:text-5xl bg-[#141414]"
          style={{ display: imgSrc ? "none" : "flex" }}
        >
          {icon}
        </div>
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1">
          <span className="badge-bestseller-emerald shadow-md text-[8px] sm:text-[9.5px]">
            AURA
          </span>
          {elem.category && (
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-slate-300 line-clamp-1">
              {elem.category}
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3">
        <div>
          <h2
            className="text-xs sm:text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors font-['Outfit']"
            title={elem.title}
          >
            {elem.title}
          </h2>
          <p
            className="text-xs text-zinc-400 mb-2 line-clamp-2 leading-relaxed hidden sm:block"
            title={elem.description}
          >
            {elem.description}
          </p>
        </div>
        <div className="space-y-2 pt-2 border-t border-white/10 mt-auto">
          <span className="text-sm sm:text-base font-extrabold text-white block font-['Outfit']">
            ₹{Number(elem.price).toLocaleString()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(elem);
            }}
            className="w-full py-2 sm:py-2.5 btn-emerald-lux text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all shadow-md cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1"
          >
            <span>ADD TO BAG</span>
            <span className="text-xs sm:text-sm">🛍️</span>
          </button>
        </div>
      </div>
    </div>
  );
});

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, setCartitem } = useUser();
  const navigate = useNavigate();

  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/search/search?q=${query}`
      );
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const handleProductClick = useCallback((id) => {
    navigate(`/product/${id}`);
  }, [navigate]);

  const handleAddToCart = useCallback(
    async (elem) => {
      if (!token) {
        alert("Please login to add items to bag!");
        navigate("/login");
        return;
      }
      try {
        const payload = {
          itemimage: Array.isArray(elem.productimage)
            ? elem.productimage[0]
            : elem.productimage,
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
        alert("Item Added to Bag! 🛍️");
        const cartRes = await axios.get(
          `${API_BASE_URL}/api/v1/cartdata/cartget`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartitem(cartRes.data.cart || []);
      } catch (err) {
        console.log("AddToCart error:", err);
      }
    },
    [token, navigate, setCartitem]
  );

  /* Memoised product list */
  const productList = useMemo(() => products, [products]);

  return (
    <div className="bg-[#121212] text-white min-h-screen font-sans">
      <Navbar />
      <div className="min-h-screen bg-[#121212] px-4 py-10 md:px-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-wider font-['Outfit'] uppercase">
            SEARCH RESULTS
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto uppercase tracking-widest">
            {query
              ? `Showing results for "${query}"`
              : "Enter a search query in the search bar above."}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#10b981] rounded-full animate-spin" />
            <span className="text-[#10b981] text-xs uppercase tracking-widest font-bold">
              Searching luxury collection...
            </span>
          </div>
        ) : (
          <>
            {productList.length === 0 && query ? (
              <div className="text-center py-20 bg-[#1e1e1e] border border-white/10 rounded-3xl max-w-lg mx-auto shadow-sm">
                <div className="text-6xl mb-6 opacity-80">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">
                  No matches found
                </h3>
                <p className="text-xs text-zinc-400 mb-6 px-8">
                  We couldn't find any luxury products matching{" "}
                  <span className="text-[#10b981] font-semibold">"{query}"</span>.
                </p>
              </div>
            ) : null}

            {productList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 max-w-7xl mx-auto">
                {productList.map((elem) => (
                  <SearchCard
                    key={elem._id}
                    elem={elem}
                    onAddToCart={handleAddToCart}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SearchPage;

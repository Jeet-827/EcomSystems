import { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

/* ── Memoised product card ── */
const HomeProductCard = memo(({ product, onAddToCart, onProductClick }) => {
  const imgSrc = Array.isArray(product.productimage)
    ? product.productimage[0]
    : product.productimage;

  return (
    <div
      onClick={() => onProductClick(product._id)}
      className="group card-aura-dark overflow-hidden flex flex-col justify-between cursor-pointer h-full border border-white/10 rounded-2xl sm:rounded-[28px] bg-[#1e1e1e] hover:border-[#10b981]/60 transition-all duration-300 shadow-xl"
    >
      <div className="relative w-full h-40 sm:h-60 bg-[#141414] overflow-hidden flex-shrink-0 flex items-center justify-center p-3.5 sm:p-5 rounded-t-2xl sm:rounded-t-[28px]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
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
          className="w-full h-full flex items-center justify-center text-4xl text-zinc-600 bg-[#141414]"
          style={{ display: imgSrc ? "none" : "flex" }}
        >
          📦
        </div>

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1.5">
          <span className="badge-bestseller-emerald shadow-md text-[8px] sm:text-[9.5px]">
            BESTSELLER
          </span>
          {product.category && (
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 backdrop-blur-md border border-white/10 line-clamp-1">
              {product.category}
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3">
        <div className="space-y-1">
          <h2
            className="text-xs sm:text-base font-bold text-white line-clamp-1 group-hover:text-[#10b981] transition-colors font-['Outfit']"
            title={product.title}
          >
            {product.title}
          </h2>
          <p
            className="text-xs text-zinc-400 line-clamp-2 leading-relaxed hidden sm:block"
            title={product.description}
          >
            {product.description || "High quality luxury sound system."}
          </p>
        </div>

        <div className="space-y-2 sm:space-y-2.5 pt-2 sm:pt-3 border-t border-white/10 mt-auto">
          <div className="flex items-baseline justify-between">
            <span className="text-sm sm:text-lg font-black text-white font-['Outfit']">
              ₹{Number(product.price).toLocaleString()}
            </span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              IN STOCK
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full py-2 sm:py-3 btn-emerald-lux text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1"
          >
            <span>ADD TO BAG</span>
            <span className="text-xs sm:text-sm">🛍️</span>
          </button>
        </div>
      </div>
    </div>
  );
});

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, setCartitem } = useUser();
  const navigate = useNavigate();

  const getAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/product/productget`,
        { withCredentials: true, headers }
      );
      setProducts(res.data.products || res.data.Products || []);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  const AddToCart = useCallback(
    async (product) => {
      if (!token) {
        toast.info("Please login to add items to cart!");
        setTimeout(() => navigate("/login"), 1000);
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
        await axios.post(
          `${API_BASE_URL}/api/v1/cartdata/cartitem`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Added to Bag! 🛍️", { autoClose: 900 });
        const cartRes = await axios.get(
          `${API_BASE_URL}/api/v1/cartdata/cartget`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartitem(cartRes.data.cart || []);
      } catch (err) {
        toast.error("Failed to add to bag");
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

  const productList = useMemo(() => products, [products]);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-4 text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-[#10b981] border border-white/10">
          <span>AURA COLLECTION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-['Outfit']">
          DISCOVER THE COLLECTION
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm tracking-widest uppercase max-w-lg mx-auto">
          Explore iconic high-end acoustic and luxury lifestyle design pieces.
        </p>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-white/20 border-t-[#10b981] rounded-full animate-spin" />
            <p className="text-zinc-400 text-xs tracking-wider uppercase font-medium">Loading store products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-4 bg-rose-950/40 border border-rose-500/30 rounded-3xl max-w-md mx-auto">
            <p className="text-rose-400 text-sm font-semibold">⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && productList.length === 0 && (
          <div className="text-center py-20 px-4 bg-[#1e1e1e] border border-white/10 rounded-3xl max-w-md mx-auto space-y-3">
            <div className="text-5xl">📦</div>
            <p className="text-white text-base font-bold">No products found</p>
            <p className="text-zinc-400 text-xs">Add products from your Admin Dashboard!</p>
          </div>
        )}

        {!loading && !error && productList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList.map((product) => (
              <HomeProductCard
                key={product._id}
                product={product}
                onAddToCart={AddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Home;

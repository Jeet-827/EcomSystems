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
      className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
    >
      <div className="relative w-full h-48 sm:h-56 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
          className="w-full h-full flex items-center justify-center text-4xl text-slate-300 bg-slate-50"
          style={{ display: imgSrc ? "none" : "flex" }}
        >
          📦
        </div>
        {product.category && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md border border-slate-200 text-indigo-700 shadow-sm pointer-events-none">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <h2
            className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors"
            title={product.title}
          >
            {product.title}
          </h2>
          <p
            className="text-xs text-slate-500 line-clamp-2 leading-relaxed"
            title={product.description}
          >
            {product.description || "High quality premium product."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-auto">
          <span className="text-base sm:text-lg font-extrabold text-slate-900 whitespace-nowrap">
            ₹{Number(product.price).toLocaleString()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-200 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            Add to Cart 🛒
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
        toast.success("Added to Cart! 🛒", { autoClose: 900 });
        const cartRes = await axios.get(
          `${API_BASE_URL}/api/v1/cartdata/cartget`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartitem(cartRes.data.cart || []);
      } catch (err) {
        toast.error("Failed to add to cart");
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
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={2500} theme="light" />
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-4 text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm">
          <span>✨</span>
          <span>EXPLORE STORE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Discover Our <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">Trending Products</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
          Explore our handpicked collection of verified quality products.
        </p>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Loading store products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-4 bg-rose-50 border border-rose-200 rounded-3xl max-w-md mx-auto">
            <p className="text-rose-600 text-sm font-semibold">⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && productList.length === 0 && (
          <div className="text-center py-20 px-4 bg-slate-50 border border-slate-200 rounded-3xl max-w-md mx-auto space-y-3">
            <div className="text-5xl">📦</div>
            <p className="text-slate-800 text-base font-bold">No products found</p>
            <p className="text-slate-500 text-xs">Add products from your Admin Dashboard!</p>
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

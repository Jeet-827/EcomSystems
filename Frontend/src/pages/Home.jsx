import { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaStar, FaSlidersH, FaSearch } from "react-icons/fa";

/* ── Memoised Light Tech Product Card ── */
const HomeProductCard = memo(({ product, onAddToCart, onProductClick }) => {
  const imgSrc = Array.isArray(product.productimage)
    ? product.productimage[0]
    : product.productimage || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";

  return (
    <div
      onClick={() => onProductClick(product._id)}
      className="group card-tech flex flex-col justify-between cursor-pointer h-full bg-white border border-slate-200 hover:border-indigo-300 transition-all duration-300 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="badge-featured">IN STOCK</span>
        {product.category && (
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {product.category}
          </span>
        )}
      </div>

      <div className="relative w-full h-44 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3">
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h2
            className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#4f46e5] transition-colors font-['Outfit']"
            title={product.title}
          >
            {product.title}
          </h2>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description || "High-performance tech hardware."}
          </p>
        </div>

        <div className="flex items-center gap-1 text-amber-400 text-xs">
          <FaStar size={11} /><FaStar size={11} /><FaStar size={11} /><FaStar size={11} /><FaStar size={11} />
          <span className="text-[10px] text-slate-400 font-semibold ml-1">(5.0)</span>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-2">
          <span className="text-base font-black text-slate-900 font-['Outfit']">
            ₹{Number(product.price).toLocaleString()}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="px-3.5 py-2 btn-purple-primary text-xs font-bold gap-1.5"
          >
            <span>Add</span>
            <FaShoppingCart size={11} />
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { token, setCartitem } = useUser();
  const navigate = useNavigate();

  const getAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/product/productget?all=true`,
        { withCredentials: true, headers }
      );
      setProducts(res.data.products || res.data.Products || []);
    } catch {
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
      } catch {
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

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    const selCat = selectedCategory.toLowerCase();
    return products.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      return (
        pCat === selCat ||
        pCat.includes(selCat) ||
        selCat.includes(pCat) ||
        (selCat === "mobile" && (pCat.includes("phone") || pCat.includes("tablet"))) ||
        (selCat === "laptop" && (pCat.includes("pc") || pCat.includes("computer"))) ||
        (selCat === "tv" && (pCat.includes("display") || pCat.includes("screen"))) ||
        (selCat === "appliances" && (pCat.includes("kitchen") || pCat.includes("home")))
      );
    });
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <section className="py-10 px-4 text-center max-w-4xl mx-auto space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-200">
          Curated Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-['Outfit']">
          EXPLORE TECH COLLECTION
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
          Discover high-performance smartphones, premium audio, OLED displays, and smart gadgets.
        </p>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none pt-4">
          {[
            { id: "all", label: "All Products" },
            { id: "mobile", label: "Smartphones" },
            { id: "laptop", label: "Laptops" },
            { id: "audio", label: "Audio" },
            { id: "watch", label: "Watches" },
            { id: "appliances", label: "Appliances" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#4f46e5] text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="spinner-purple" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-4 bg-rose-50 border border-rose-200 rounded-2xl max-w-md mx-auto">
            <p className="text-rose-600 text-sm font-semibold">⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-3xl max-w-md mx-auto space-y-3 shadow-sm">
            <div className="text-5xl">📦</div>
            <p className="text-slate-900 text-base font-bold">No products found</p>
            <p className="text-slate-500 text-xs">Try selecting another category or check back later.</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
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

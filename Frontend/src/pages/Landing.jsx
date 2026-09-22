import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import {
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaArrowRight,
  FaClock,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaHeadset,
  FaMusic,
  FaPlane,
} from "react-icons/fa";
import {
  MdWatch,
  MdHeadphones,
  MdSmartphone,
  MdLaptopMac,
  MdTv,
  MdSportsEsports,
  MdPhotoCamera,
} from "react-icons/md";

/* ── Popular Category Circles (React Icons) ── */
const POPULAR_CATEGORIES = [
  { id: "watch", label: "Watches", Icon: MdWatch },
  { id: "audio", label: "Headphones", Icon: MdHeadphones },
  { id: "mobile", label: "Smartphones", Icon: MdSmartphone },
  { id: "watch", label: "Smart Watch", Icon: FaClock },
  { id: "audio", label: "Earbuds", Icon: FaMusic },
  { id: "gaming", label: "Gaming", Icon: MdSportsEsports },
  { id: "camera", label: "Cameras", Icon: MdPhotoCamera },
  { id: "laptop", label: "Laptops", Icon: MdLaptopMac },
  { id: "tv", label: "TV & Display", Icon: MdTv },
  { id: "camera", label: "Drones", Icon: FaPlane },
];

/* ── Trending Search Keyword Pills (Figma) ── */
const TRENDING_TAGS = [
  "Smart Watch",
  "Air Conditioners",
  "OLED TV",
  "Gaming Laptop",
  "Headphone X1",
  "Earbuds Pro",
  "PlayStation 5",
  "DSLR Camera",
  "Robotic Vacuum",
  "Soundbar Pro",
  "Drone 4K",
  "Apple iPad",
];

/* ── Reusable Light Tech Product Card ── */
const TechProductCard = memo(({ product, onAddToCart, onProductClick, showBadge = true }) => {
  const { isInWishlist, toggleWishlist } = useUser();
  const isWishlisted = isInWishlist(product?._id);

  const imgSrc = Array.isArray(product?.productimage)
    ? product.productimage[0]
    : product?.productimage || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";

  const discountPercent = product?.discount || (product?.price ? Math.floor(((product.price * 1.3 - product.price) / (product.price * 1.3)) * 100) : 20);
  const oldPrice = product?.oldPrice || (product?.price ? Math.round(product.price * 1.25) : 0);

  return (
    <div
      onClick={() => onProductClick(product._id)}
      className="group card-tech flex flex-col justify-between cursor-pointer h-full bg-white border border-slate-200 hover:border-indigo-300 transition-all duration-300 p-4"
    >
      {/* Top badges & Wishlist */}
      <div className="flex items-center justify-between mb-2">
        {showBadge ? (
          <span className="badge-discount">-{discountPercent}%</span>
        ) : (
          <span className="badge-category">{product?.category || "Gadget"}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const added = toggleWishlist(product);
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

      {/* Product Image */}
      <div className="relative w-full h-40 sm:h-44 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3">
        <img
          src={imgSrc}
          alt={product?.title || "Product"}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";
          }}
        />
      </div>

      {/* Details */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
            {product?.category || "Electronics"}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#4f46e5] transition-colors font-['Outfit']">
            {product?.title || "Premium Tech Gadget"}
          </h3>
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-1 text-amber-400 text-xs">
          <FaStar size={11} />
          <FaStar size={11} />
          <FaStar size={11} />
          <FaStar size={11} />
          <FaStar size={11} className="text-amber-300" />
          <span className="text-[10px] text-slate-400 font-semibold ml-1">(4.9)</span>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 font-['Outfit']">
                ₹{Number(product?.price || 1999).toLocaleString()}
              </span>
              {oldPrice > 0 && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{Number(oldPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-[#4f46e5] text-[#4f46e5] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
            title="Add to bag"
          >
            <FaShoppingCart size={13} />
          </button>
        </div>
      </div>
    </div>
  );
});

function Landing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBestSellerTab, setSelectedBestSellerTab] = useState("all");
  const [selectedSuggestedTab, setSelectedSuggestedTab] = useState("recommended");
  const [selectedJustLandingTab, setSelectedJustLandingTab] = useState("all");

  // Countdown timer for Weekly Deals (Figma [ 08 : 34 : 52 ])
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 34, seconds: 52 });

  const { token, setCartitem } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget?all=true`);
      const items = res.data.products || res.data.Products || [];
      setProducts(items);
    } catch {
      // Fallback sample tech products if backend database is fresh
      setProducts([
        {
          _id: "demo-1",
          title: "Sony Bravia 65-Inch 4K OLED Ultra HD Smart TV",
          price: 124999,
          category: "tv",
          description: "Stunning 4K OLED contrast with Cognitive Processor XR.",
          productimage: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60",
        },
        {
          _id: "demo-2",
          title: "De'Longhi Dedica Deluxe Espresso Machine",
          price: 24999,
          category: "appliances",
          description: "Barista-quality espresso at the touch of a button.",
          productimage: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=60",
        },
        {
          _id: "demo-3",
          title: "Apple iPad Air 64GB M2 Liquid Retina",
          price: 59900,
          category: "mobile",
          description: "Supercharged by the blazing fast Apple M2 chip.",
          productimage: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60",
        },
        {
          _id: "demo-4",
          title: "Dyson Purifier Hot+Cool Gen1 Smart Hub",
          price: 39900,
          category: "appliances",
          description: "Purifies, heats, and cools with intelligent sensor control.",
          productimage: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=60",
        },
        {
          _id: "demo-5",
          title: "Bose QuietComfort 45 Wireless Noise Cancelling",
          price: 29900,
          category: "audio",
          description: "World-class acoustic noise cancelling with high-fidelity audio.",
          productimage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        },
        {
          _id: "demo-6",
          title: "Canon EOS R6 Mark II Mirrorless Camera",
          price: 189999,
          category: "camera",
          description: "Pro 24.2 MP full-frame sensor with 4K60p 10-bit video.",
          productimage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60",
        },
        {
          _id: "demo-7",
          title: "Samsung Odyssey OLED G9 Curved Gaming Monitor",
          price: 119999,
          category: "gaming",
          description: "49-inch dual QHD with 240Hz refresh rate and 0.03ms response.",
          productimage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
        },
        {
          _id: "demo-8",
          title: "Devialet Phantom III High-End Acoustic Speaker",
          price: 155000,
          category: "audio",
          description: "Ultra-dense sound with physical impact and zero distortion.",
          productimage: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=60",
        },
      ]);
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
        toast.success("Added to Shopping Bag!", { autoClose: 900 });
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

  const espressoProduct = useMemo(() => {
    return (
      products.find(
        (p) =>
          p.title?.toLowerCase().includes("espresso") ||
          p.title?.toLowerCase().includes("dedica") ||
          p.title?.toLowerCase().includes("de'longhi")
      ) || {
        _id: "deal-hero-espresso",
        title: "De'Longhi Dedica Deluxe Espresso & Cappuccino Maker",
        price: 24999,
        category: "appliances",
        description: "Barista-quality espresso maker.",
        productimage: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80"],
      }
    );
  }, [products]);

  // Filter products by tab
  const bestSellerProducts = useMemo(() => {
    if (selectedBestSellerTab === "all") return products.slice(0, 5);
    return products.filter((p) => p.category?.toLowerCase() === selectedBestSellerTab).slice(0, 5);
  }, [products, selectedBestSellerTab]);

  const suggestedProducts = useMemo(() => {
    return products.slice(0, 10);
  }, [products]);

  const justLandingProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* ── 1. Popular Categories Circular Row (Figma Top Bar) ── */}
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider font-['Outfit']">
              Popular Categories
            </h2>
            <Link
              to="/allproducts"
              className="text-xs font-bold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1"
            >
              View All <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-1">
            {POPULAR_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.Icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/allproducts?category=${cat.id}`)}
                  className="category-circle-btn flex-shrink-0"
                >
                  <div className="category-circle-icon text-[#4f46e5]">
                    <IconComp size={26} />
                  </div>
                  <span className="category-circle-label">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 2. Hero Banner Grid (Figma Large TV + Gadget Cards) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main 4K OLED TV Big Banner (Left 8 cols) */}
          <div className="lg:col-span-8 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] rounded-3xl p-6 sm:p-10 text-white flex flex-col justify-between min-h-[360px] sm:min-h-[420px] relative overflow-hidden shadow-xl">
            {/* Ambient Background Glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-md space-y-3">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                OLED 4K Ultra HD
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none font-['Outfit']">
                SONIC 4K OLED VISION.
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
                Experience ultra-deep blacks, infinite contrast, and studio-grade cinematic acoustics.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate("/allproducts?category=tv")}
                  className="px-6 py-3 btn-purple-primary text-xs font-black uppercase tracking-wider"
                >
                  Shop Now →
                </button>
              </div>
            </div>

            <div className="absolute right-2 sm:right-6 bottom-4 sm:bottom-6 w-56 sm:w-80 max-h-60 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80"
                alt="4K OLED TV"
                className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Humidifying Fan Card (Right 4 cols) */}
          <div className="lg:col-span-4 bg-gradient-to-tr from-[#6366f1] via-[#4f46e5] to-[#4338ca] rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[360px]">
            <div className="relative z-10 space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md">
                Smart Home Tech
              </span>
              <h2 className="text-2xl font-black font-['Outfit'] leading-tight">
                Humidifying Smart Fan
              </h2>
              <p className="text-xs text-indigo-100">
                Dual airflow vortex with aroma diffusion.
              </p>
            </div>

            <div className="relative z-10 w-full flex items-center justify-center my-4">
              <img
                src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop&q=80"
                alt="Smart Humidifier Fan"
                className="w-44 h-44 object-contain drop-shadow-2xl animate-float-gentle"
              />
            </div>

            <button
              onClick={() => navigate("/allproducts?category=appliances")}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-[#4f46e5] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Discover Gadget
            </button>
          </div>

          {/* Bottom 3 Mini Promo Banners */}
          <div className="lg:col-span-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                Tablet Series
              </span>
              <h3 className="text-lg font-black font-['Outfit'] mt-1">iPad mini 64GB</h3>
              <p className="text-xs text-amber-100 mt-0.5">Now with A15 Bionic</p>
              <button
                onClick={() => navigate("/allproducts?category=mobile")}
                className="mt-3 text-xs font-extrabold bg-white text-orange-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
              >
                Buy Now →
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&auto=format&fit=crop&q=80"
              alt="iPad mini"
              className="w-24 h-24 object-contain drop-shadow-lg"
            />
          </div>

          <div className="lg:col-span-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-emerald-300">
                Eco Smart
              </span>
              <h3 className="text-lg font-black font-['Outfit'] mt-1">Air Purifier IoT</h3>
              <p className="text-xs text-slate-300 mt-0.5">99.97% HEPA Filtration</p>
              <button
                onClick={() => navigate("/allproducts?category=appliances")}
                className="mt-3 text-xs font-extrabold bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Explore →
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&auto=format&fit=crop&q=80"
              alt="Air Purifier"
              className="w-24 h-24 object-contain drop-shadow-lg"
            />
          </div>

          <div className="lg:col-span-4 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                Home Appliance
              </span>
              <h3 className="text-lg font-black font-['Outfit'] mt-1">Inverter Washer</h3>
              <p className="text-xs text-sky-100 mt-0.5">Quiet Steam Clean Pro</p>
              <button
                onClick={() => navigate("/allproducts?category=appliances")}
                className="mt-3 text-xs font-extrabold bg-white text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
              >
                Shop Now →
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&auto=format&fit=crop&q=80"
              alt="Washer"
              className="w-24 h-24 object-contain drop-shadow-lg"
            />
          </div>
        </section>

        {/* ── 3. Best Weekly Deals (Figma Spotlight with Countdown Timer) ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Section Header with Live Countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                Best Weekly Deals
              </h2>
              <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black border border-red-200">
                <FaClock size={12} className="animate-pulse" />
                <span>
                  {String(timeLeft.hours).padStart(2, "0")} : {String(timeLeft.minutes).padStart(2, "0")} : {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            <Link
              to="/allproducts?category=deals"
              className="text-xs font-bold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1"
            >
              View All Deals <FaArrowRight size={10} />
            </Link>
          </div>

          {/* Deals Grid Layout (Figma: Left Stack + Center Big Card + Right 2x2 Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (2 Stacked Deal Cards) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {products.slice(0, 2).map((p) => (
                <TechProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>

            {/* Center Big Hero Deal Spotlight (De'Longhi Espresso Coffee Machine) */}
            <div
              onClick={() => espressoProduct._id && handleProductClick(espressoProduct._id)}
              className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="badge-discount text-xs px-3 py-1">SPECIAL DEAL -35%</span>
                <span className="text-xs font-bold text-slate-400">HOT DEAL</span>
              </div>

              <div className="my-6 flex items-center justify-center">
                <img
                  src={
                    Array.isArray(espressoProduct.productimage)
                      ? espressoProduct.productimage[0]
                      : espressoProduct.productimage || "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80"
                  }
                  alt={espressoProduct.title}
                  className="max-h-64 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase text-slate-400">
                  {espressoProduct.category || "Kitchen & Appliances"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit'] leading-snug group-hover:text-[#4f46e5] transition-colors">
                  {espressoProduct.title}
                </h3>

                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <div className="flex">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">(4.8 / 120 reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-slate-900 font-['Outfit']">
                    ₹{Number(espressoProduct.price).toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400 line-through">₹38,499</span>
                </div>

                {/* Progress bar (Sold: 38/50) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Already Sold: <strong className="text-slate-900">38</strong></span>
                    <span>Available: <strong className="text-indigo-600">12</strong></span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[76%] rounded-full" />
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(espressoProduct);
                  }}
                  className="w-full py-3 btn-purple-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <FaShoppingCart size={13} />
                  <span>Add To Bag</span>
                </button>
              </div>
            </div>

            {/* Right Column (4 Cards in 2x2 Grid) */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.slice(2, 6).map((p) => (
                <TechProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Trending Searched Keywords & VR Banner (Figma) ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit']">
              Trending Searched:
            </h2>
            <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-none py-1">
              {TRENDING_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all flex-shrink-0 cursor-pointer shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Wide Futuristic VR Promo Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2 max-w-xl text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-500/30">
                Next-Gen Spatial Computing
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] leading-tight">
                VIRTUAL REALITY HEADSET 50% OFF
              </h3>
              <p className="text-xs text-slate-300">
                Step into ultra-realistic 8K dual displays with immersive spatial 3D audio.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/allproducts?category=gaming")}
                className="px-6 py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
              >
                Discover VR →
              </button>
            </div>
          </div>
        </section>

        {/* ── 5. Best Sellers Section (Figma with Filter Tabs) ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              Best Sellers
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "all", label: "All" },
                { id: "mobile", label: "Smartphones" },
                { id: "laptop", label: "Laptops" },
                { id: "watch", label: "Smart Watch" },
                { id: "audio", label: "Audio" },
                { id: "camera", label: "Cameras" },
                { id: "gaming", label: "Gaming" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedBestSellerTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                    selectedBestSellerTab === tab.id
                      ? "bg-[#4f46e5] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Column Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {bestSellerProducts.map((p) => (
              <TechProductCard
                key={p._id}
                product={p}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </section>

        {/* ── 6. Popular Brands Promo Cards (Figma 3 Banner Cards) ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-900 rounded-2xl p-6 text-white flex flex-col justify-between min-h-[220px] shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">
                Brand Highlight
              </span>
              <h3 className="text-xl font-black font-['Outfit'] mt-1">Next-Gen VR Experience</h3>
              <p className="text-xs text-slate-300 mt-1">Immerse in photorealistic worlds.</p>
            </div>
            <button
              onClick={() => navigate("/allproducts?category=gaming")}
              className="w-fit mt-4 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Shop Collection →
            </button>
          </div>

          <div className="bg-gradient-to-tr from-orange-600 to-rose-600 rounded-2xl p-6 text-white flex flex-col justify-between min-h-[220px] shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-200">
                Special Edition
              </span>
              <h3 className="text-xl font-black font-['Outfit'] mt-1">Signature Sound Series</h3>
              <p className="text-xs text-orange-100 mt-1">Audiophile tuned precision drivers.</p>
            </div>
            <button
              onClick={() => navigate("/allproducts?category=audio")}
              className="w-fit mt-4 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Explore Audio →
            </button>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between min-h-[220px] shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Action & Drone
              </span>
              <h3 className="text-xl font-black font-['Outfit'] mt-1">GoPro Action 4K</h3>
              <p className="text-xs text-slate-300 mt-1">Rock-steady stabilization anywhere.</p>
            </div>
            <button
              onClick={() => navigate("/allproducts?category=camera")}
              className="w-fit mt-4 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              View Cameras →
            </button>
          </div>
        </section>

        {/* ── 7. Suggested Today (Top Picks Grid) ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              Suggested Today
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "recommended", label: "Recommended" },
                { id: "top", label: "Top Rated" },
                { id: "sale", label: "On Sale" },
                { id: "trending", label: "Trending" },
                { id: "new", label: "New Arrivals" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSuggestedTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                    selectedSuggestedTab === tab.id
                      ? "bg-[#4f46e5] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {suggestedProducts.map((p) => (
              <TechProductCard
                key={p._id}
                product={p}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </section>

        {/* ── 8. Devialet Phantom III Spotlight & Best Selling Speakers ── */}
        <section className="bg-[#eef2f6] rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Big Spotlight Banner */}
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white">
                Ultra High-End Acoustic
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-['Outfit'] leading-tight">
                Devialet Phantom III Speaker
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md">
                Unreasonable sound quality. 108 dB SPL, 14Hz to 27kHz frequency response, zero background noise.
              </p>
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl sm:text-3xl font-black text-[#4f46e5] font-['Outfit']">
                  $1,550.00
                </span>
                <span className="text-xs text-slate-500 font-bold uppercase">Free Global Shipping</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate("/allproducts?category=audio")}
                  className="px-6 py-3 btn-purple-primary text-xs font-black uppercase tracking-wider"
                >
                  Buy Devialet Now →
                </button>
              </div>

              <div className="pt-4 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80"
                  alt="Devialet Speaker"
                  className="max-h-52 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right: 3 Speaker Product Cards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                  Best Selling Speakers
                </h3>
                <Link
                  to="/allproducts?category=audio"
                  className="text-xs font-bold text-[#4f46e5] hover:text-[#4338ca]"
                >
                  View All ›
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {products
                  .filter((p) => p.category?.toLowerCase() === "audio")
                  .slice(0, 3)
                  .map((p) => (
                    <TechProductCard
                      key={p._id}
                      product={p}
                      onAddToCart={handleAddToCart}
                      onProductClick={handleProductClick}
                    />
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. Just Landing Section ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              Just Landing
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "all", label: "All Products" },
                { id: "tv", label: "TV & Audio" },
                { id: "mobile", label: "Smartphones" },
                { id: "laptop", label: "Laptops" },
                { id: "appliances", label: "Home & Kitchen" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedJustLandingTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                    selectedJustLandingTab === tab.id
                      ? "bg-[#4f46e5] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {justLandingProducts.map((p) => (
              <TechProductCard
                key={p._id}
                product={p}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </section>

        {/* ── 10. Blog & Customer Testimonials (Figma 2-Column Section) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Latest Tech Insights */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 font-['Outfit'] uppercase tracking-wider">
                Latest Tech Insights
              </h3>
              <span className="text-xs font-bold text-[#4f46e5] cursor-pointer">Read All ›</span>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&auto=format&fit=crop&q=80"
                  alt="Blog thumbnail"
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#4f46e5] uppercase">
                    Display Tech • 5 min read
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">
                    Why 2026 OLED Panels Are Revolutionizing Living Room Home Theaters
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">May 24, 2026</p>
                </div>
              </div>

              <div className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200&auto=format&fit=crop&q=80"
                  alt="Blog thumbnail"
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#4f46e5] uppercase">
                    Audio Guide • 4 min read
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">
                    The Science Behind Spatial 3D Audio and High-Fidelity Drivers
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">May 20, 2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Customer Reviews */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-black text-slate-900 font-['Outfit'] uppercase tracking-wider">
                  Verified Reviews
                </h3>
                <span className="text-xs font-bold text-amber-500">★★★★★ 4.9/5</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                "The delivery was ultra fast, and the De'Longhi espresso maker is by far the best appliance I've ever owned. TREO's support team answered my questions within minutes!"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#4f46e5] font-black flex items-center justify-center text-sm">
                MK
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Markus Kowalski</h5>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  ✓ Verified Tech Buyer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. Full-Width Royal Purple Newsletter Ribbon (Figma Banner) ── */}
        <section className="bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3730a3] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-lg">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Exclusive VIP Perks
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit']">
              Subscribe & Get 10% OFF your first order
            </h2>
            <p className="text-xs text-indigo-100">
              Join over 50,000+ tech lovers receiving exclusive flash sales and weekly hardware drops.
            </p>
          </div>

          <div className="w-full md:w-auto max-w-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Thank you for subscribing! 10% discount applied to your account.");
              }}
              className="flex items-center bg-white rounded-2xl p-1.5 shadow-lg"
            >
              <input
                type="email"
                placeholder="Enter your email address..."
                required
                className="flex-1 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none rounded-xl"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

        {/* ── 12. Service Highlights Benefit Bar (Figma 4 Highlights) ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center flex-shrink-0 text-xl">
              <FaTruck />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">Free Delivery</h4>
              <p className="text-[11px] text-slate-400">On all orders over $99</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaUndo />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">90 Days Return</h4>
              <p className="text-[11px] text-slate-400">Money back guarantee</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaShieldAlt />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">100% Secure</h4>
              <p className="text-[11px] text-slate-400">SSL Encrypted checkout</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaHeadset />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">24/7 Support</h4>
              <p className="text-[11px] text-slate-400">Dedicated assistance</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Landing;

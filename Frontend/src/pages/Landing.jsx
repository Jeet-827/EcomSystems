import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ─── 360° Auto-Rotating Product Banner Carousel ─── */
const BannerCarousel = memo(({ products, onProductClick, onAddToCart }) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const total = products.length;

  const goTo = useCallback((idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);

  useEffect(() => {
    if (total === 0) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next, total]);

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[380px] bg-[#121212]">
      <div className="landing-spinner" />
      <p className="text-white/70 text-xs mt-3 uppercase tracking-widest font-bold">Loading collection...</p>
    </div>
  );

  const product = products[current];
  const imgSrc = Array.isArray(product.productimage)
    ? product.productimage[0]
    : product.productimage;

  return (
    <div className="banner-carousel rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-4 max-w-7xl mx-auto">
      <div
        key={current}
        className="banner-slide bg-gradient-to-r from-[#1a1a1a] via-[#141414] to-[#0d0d0d] min-h-[420px] sm:min-h-[460px] p-6 sm:p-12"
      >
        <div className="banner-text max-w-xl">
          <h2 className="banner-title text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-tight font-['Outfit']">
            SONIC ELEGANCE.
          </h2>
          <p className="banner-desc text-slate-300 text-sm sm:text-base mt-4 leading-relaxed font-medium">
            Discover the new AURA x Bang & Olufsen collection.
          </p>

          <div className="banner-btns flex items-center gap-3 mt-8">
            <button className="px-7 py-3.5 btn-emerald-lux text-xs font-extrabold cursor-pointer" onClick={() => onProductClick(product._id)}>
              EXPLORE THE COLLECTION
            </button>
          </div>
        </div>

        <div className="banner-img-wrap relative">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-emerald-500/10 blur-3xl absolute inset-0" />
          <img src={imgSrc} alt={product.title} className="banner-img relative z-10 max-h-[300px] object-contain drop-shadow-2xl" />
        </div>
      </div>

      <button className="banner-arrow banner-arrow-left" onClick={prev} aria-label="Previous">‹</button>
      <button className="banner-arrow banner-arrow-right" onClick={next} aria-label="Next">›</button>

      {/* Clean Slide Dots Indicator */}
      <div className="banner-dots">
        {products.map((_, i) => (
          <button
            key={i}
            className={`banner-dot ${i === current ? "banner-dot-active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
});



/* ─── Promo Banner Card ─── */
/* ─── Promo Banner Card ─── */
const PromoBannerCard = memo(({ tag, title, discount, image, productId, color, onProductClick }) => (
  <div
    onClick={() => productId ? onProductClick(productId) : null}
    className="relative overflow-hidden rounded-[28px] cursor-pointer group border border-white/10 hover:border-emerald-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-[#1e1e1e]"
    style={{ minHeight: 180 }}
  >
    {/* Emerald accent top bar */}
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[28px] bg-emerald-600" />

    <div className="flex items-stretch h-full">
      {/* Text Side */}
      <div className="flex-1 p-5 flex flex-col justify-between z-10 min-w-0">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-500/30 mb-2">
            {tag}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 mb-2 font-['Outfit']">
            {title}
          </h4>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-baseline sm:items-center justify-between gap-1.5 pt-2">
          <span className="text-base sm:text-lg font-black text-emerald-400 font-['Outfit']">
            {discount}
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors whitespace-nowrap">
            Explore Now →
          </span>
        </div>
      </div>
      {/* Image Side */}
      {image && (
        <div className="flex-shrink-0 w-28 sm:w-36 relative overflow-hidden bg-[#141414] flex items-center justify-center p-3 rounded-r-[28px]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
    </div>
  </div>
));

/* ─── Product Card ─── */
const ProductPosterCard = memo(({ product, onProductClick, onAddToCart }) => {
  const imgSrc = Array.isArray(product.productimage)
    ? product.productimage[0]
    : product.productimage;

  return (
    <div
      className="group card-aura-dark overflow-hidden flex flex-col justify-between cursor-pointer h-full border border-white/10 rounded-2xl sm:rounded-[28px] bg-[#1e1e1e] hover:border-emerald-500/50 transition-all duration-300 shadow-xl"
      onClick={() => onProductClick(product._id)}
    >
      <div className="relative w-full h-40 sm:h-60 bg-[#141414] overflow-hidden flex-shrink-0 flex items-center justify-center p-3.5 sm:p-5 rounded-t-2xl sm:rounded-t-[28px]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
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

      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors font-['Outfit']">
            {product.title}
          </h4>
          <div className="flex items-center justify-between mt-1 gap-1">
            <p className="text-sm sm:text-base font-black text-white font-['Outfit']">
              ₹{product.price?.toLocaleString()}
            </p>
            {product.category && (
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-slate-300 line-clamp-1">
                {product.category}
              </span>
            )}
          </div>
        </div>

        <button
          className="w-full py-2 sm:py-3 btn-emerald-lux text-[11px] sm:text-xs font-bold rounded-xl sm:rounded-2xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-1 mt-1"
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        >
          <span>ADD TO BAG</span>
          <span className="text-xs sm:text-sm">🛍️</span>
        </button>
      </div>
    </div>
  );
});

/* ─── Feature Card ─── */
const FeatureCard = memo(({ icon, title, desc, accent }) => (
  <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-white/10 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-bold text-white mb-1 font-['Outfit']">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
));

/* ─── Category Pill ─── */
const CategoryPill = memo(({ name, count, image, icon }) => (
  <Link
    to={`/allproducts?category=${encodeURIComponent(name)}`}
    className="flex items-center gap-2.5 sm:gap-3.5 p-3.5 bg-[#1e1e1e] border border-white/10 rounded-2xl hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
  >
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#141414] flex-shrink-0 flex items-center justify-center border border-white/10 p-1">
      {image
        ? <img src={image} alt={name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
        : <span className="text-lg sm:text-2xl">{icon || "📦"}</span>
      }
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate font-['Outfit']">{name}</h4>
      <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">{count} Product{count !== 1 ? "s" : ""}</span>
    </div>
    <span className="text-slate-500 group-hover:text-emerald-400 transition-colors font-bold text-base sm:text-lg hidden xs:inline">›</span>
  </Link>
));

/* ─── Testimonial Card ─── */
const TestimonialCard = memo(({ name, role, text, avatar }) => (
  <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-5 sm:p-6 hover:border-emerald-500/40 transition-all duration-300">
    <div className="text-amber-400 text-sm mb-3">★★★★★</div>
    <p className="text-sm text-slate-300 italic leading-relaxed mb-4">"{text}"</p>
    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
        {avatar}
      </div>
      <div>
        <h5 className="text-xs font-bold text-white font-['Outfit']">{name}</h5>
        <span className="text-[10px] text-slate-400">{role}</span>
      </div>
    </div>
  </div>
));

/* ── Constants ── */
const CATEGORY_ICONS = {
  mobile: "📱", phone: "📱", smartphone: "📱",
  watch: "⌚", smartwatch: "⌚",
  shoe: "👟", shoes: "👟", footwear: "👟", sneaker: "👟",
  makeup: "💄", beauty: "💄", cosmetic: "💄",
  fashion: "👗", cloth: "👗", clothing: "👗", dress: "👗", wear: "👗",
  audio: "🎧", earphone: "🎧", headphone: "🎧", speaker: "🔊",
  laptop: "💻", computer: "🖥️", tablet: "📲",
  camera: "📷", tv: "📺", television: "📺",
  bag: "👜", accessories: "🧢", jewel: "💍", jewellery: "💍",
  book: "📚", sport: "⚽", fitness: "🏋️", toy: "🧸",
  furniture: "🪑", appliance: "🏠", kitchen: "🍳",
  default: "📦",
};

function getCategoryIcon(name) {
  const lower = (name || "").toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key !== "default" && lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

const FEATURES = [
  { icon: "⚡", title: "Instant Delivery", desc: "Express delivery to your doorstep within 24-48 hours.", accent: "bg-amber-50" },
  { icon: "🛡️", title: "100% Genuine", desc: "Guaranteed authentic products straight from verified brands.", accent: "bg-emerald-50" },
  { icon: "🔒", title: "Safe Checkout", desc: "Bank-grade encryption ensures your payments are always secure.", accent: "bg-blue-50" },
  { icon: "🔄", title: "Easy Returns", desc: "No questions asked 7-day return and exchange policy.", accent: "bg-purple-50" },
];

const TESTIMONIALS = [
  { name: "Aarav Sharma", role: "Tech Enthusiast", text: "Ordered a smartwatch and got it the next day! The UI looks super clean and the checkout is seamless.", avatar: "A" },
  { name: "Neha Patel", role: "Verified Buyer", text: "Clicking on products to see instant details is so smooth. Great shopping experience every single time!", avatar: "N" },
  { name: "Vikram Malhotra", role: "Frequent Shopper", text: "The deal banners are amazing. Got 30% off on my shoes. Highly recommended to all my friends!", avatar: "V" },
];

/* ─── Section Header Component ─── */
const SectionHeader = ({ kicker, title, desc }) => (
  <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm">
      {kicker}
    </span>
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
      {title}
    </h2>
    {desc && <p className="text-slate-500 text-sm sm:text-base">{desc}</p>}
  </div>
);

/* ── Loading Spinner ── */
const LoaderBox = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="landing-spinner" />
    <p className="text-slate-500 text-sm">{text}</p>
  </div>
);

/* ══════════════ LANDING PAGE ══════════════ */
function Landing() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigate = useNavigate();
  const { token, setCartitem } = useUser();

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget?limit=8`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.log("Error loading products for landing:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/product/categories`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log("Error loading categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const categoryProducts = useMemo(() => {
    if (!categories || categories.length === 0) return products;
    const catProds = categories
      .map((cat) => cat.product)
      .filter((p) => p && p.title && p.productimage);
    return catProds.length > 0 ? catProds : products;
  }, [categories, products]);

  const handleProductClick = useCallback((id) => {
    navigate(id ? `/product/${id}` : "/allproducts");
  }, [navigate]);

  const handleAddToCart = useCallback(async (product) => {
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
      await axios.post(`${API_BASE_URL}/api/v1/cartdata/cartitem`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Added to Cart! 🛒", { autoClose: 800 });
      const cartRes = await axios.get(`${API_BASE_URL}/api/v1/cartdata/cartget`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartitem(cartRes.data.cart || []);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  }, [token, navigate, setCartitem]);

  const handleSubscribe = useCallback((e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  }, [email]);

  const promoBanners = useMemo(() => {
    const p1 = products[0], p2 = products[1], p3 = products[2];
    return [
      { tag: "HOT DEAL", title: p1?.title || "Smart Next-Gen Electronics", discount: "40% OFF", image: p1 ? (Array.isArray(p1.productimage) ? p1.productimage[0] : p1.productimage) : null, productId: p1?._id, color: "#4f46e5" },
      { tag: "TRENDING", title: p2?.title || "Premium Fashion & Apparel", discount: "UP TO 50% OFF", image: p2 ? (Array.isArray(p2.productimage) ? p2.productimage[0] : p2.productimage) : null, productId: p2?._id, color: "#059669" },
      { tag: "LIMITED EDITION", title: p3?.title || "Luxury Footwear Collection", discount: "FLAT 30% OFF", image: p3 ? (Array.isArray(p3.productimage) ? p3.productimage[0] : p3.productimage) : null, productId: p3?._id, color: "#d97706" },
    ];
  }, [products]);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col">

      {/* ══ NAVBAR ══ */}
      <Navbar />

      {/* ══ HERO BANNER CAROUSEL ══ */}
      <section>
        <BannerCarousel
          products={categoryProducts}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </section>

      {/* ══ QUICK CATEGORY BAR SECTION ══ */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-['Outfit']">
                <span>🗂️</span> Quick Category Filter
              </span>
              <a href="#categories" className="text-xs font-bold text-emerald-400 hover:underline">
                View Catalog ({categories.length}) →
              </a>
            </div>
            
            <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto pb-1.5 pt-1 scrollbar-none">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/allproducts?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-emerald-600 hover:text-white border border-white/10 text-slate-200 font-bold text-xs transition-all duration-200 whitespace-nowrap flex-shrink-0 group shadow-sm"
                >
                  <span className="text-base">{getCategoryIcon(cat.name)}</span>
                  <span>{cat.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/10 group-hover:bg-white/20 text-slate-300 group-hover:text-white">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ PROMO BANNERS ══ */}
      <section id="deals" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeader
          kicker="✨ EXCLUSIVES & DEALS"
          title="Featured Product Banners"
          desc="Click any banner to open full product details"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {promoBanners.map((banner, idx) => (
            <PromoBannerCard key={idx} {...banner} onProductClick={handleProductClick} />
          ))}
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══ */}
      <section id="featured" className="bg-[#0f0f0f] py-14 sm:py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="🔥 TOP PICKS FOR YOU"
            title="Trending Products"
            desc="Click on any product to view price, details & buy options"
          />

          {loadingProducts ? (
            <LoaderBox text="Fetching products from AURA store..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {products.map((product) => (
                <ProductPosterCard
                  key={product._id}
                  product={product}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:mt-12">
            <Link
              to="/allproducts"
              className="inline-flex items-center gap-2 px-8 py-4 btn-emerald-lux text-xs font-bold shadow-xl"
            >
              VIEW ALL PRODUCTS →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ══ */}
      <section id="categories" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeader
          kicker="🗂️ EXPLORE STORE"
          title="Shop by Category"
          desc="Browse all products by their category"
        />

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {categories.map((cat) => (
              <CategoryPill
                key={cat.name}
                name={cat.name}
                count={cat.count}
                image={Array.isArray(cat.image) ? cat.image[0] : cat.image}
                icon={getCategoryIcon(cat.name)}
              />
            ))}
          </div>
        ) : (
          <LoaderBox text="Loading categories..." />
        )}
      </section>

      {/* ══ WHY US ══ */}
      <section id="why-us" className="bg-[#0f0f0f] py-14 sm:py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="💎 WHY CHOOSE US"
            title="Designed For Seamless Shopping"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {FEATURES.map((feat) => (
              <FeatureCard key={feat.title} {...feat} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeader
          kicker="💬 REVIEWS"
          title="Loved by Thousands"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      {/* ══ NEWSLETTER ══ */}
      <section className="bg-gradient-to-r from-purple-900 via-indigo-950 to-emerald-950 py-16 sm:py-20 px-4 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-4">
            ⚡ Flash Sale Alerts
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight font-['Outfit']">
            Stay Updated With Flash Sales
          </h3>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            Subscribe to receive exclusive discount coupons and early access to product releases.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e1e1e] border border-emerald-500/50 rounded-xl text-emerald-400 font-bold text-sm">
              ✅ Thank you! Check your inbox for your 15% discount code.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-xl bg-[#121212] border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <button
                type="submit"
                className="px-6 py-3 btn-emerald-lux text-xs cursor-pointer whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;

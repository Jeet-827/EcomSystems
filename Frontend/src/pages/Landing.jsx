import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
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
    <div className="flex flex-col items-center justify-center min-h-[380px] bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="landing-spinner" />
      <p className="text-white/70 text-sm mt-3">Loading banners...</p>
    </div>
  );

  const product = products[current];
  const imgSrc = Array.isArray(product.productimage)
    ? product.productimage[0]
    : product.productimage;

  return (
    <div className="banner-carousel">
      <div
        key={current}
        className="banner-slide"
        style={{
          background: `linear-gradient(135deg,
            hsl(${(current * 47) % 360},72%,20%) 0%,
            hsl(${(current * 47 + 40) % 360},65%,38%) 60%,
            hsl(${(current * 47 + 80) % 360},60%,30%) 100%)`
        }}
      >
        <div className="banner-text">
          <span className="banner-badge">🔥 {product.category ? `${product.category} Collection` : "Featured Pick"}</span>
          <h2 className="banner-title">{product.title}</h2>
          <p className="banner-desc">{product.description?.slice(0, 120)}{product.description?.length > 120 ? "..." : ""}</p>
          <div className="banner-price-row">
            <span className="banner-price">₹{product.price?.toLocaleString()}</span>
            <span className="banner-old-price">₹{Math.round(product.price * 1.25).toLocaleString()}</span>
            <span className="banner-discount">20% OFF</span>
          </div>
          <div className="banner-btns">
            <button className="banner-btn-primary" onClick={() => onProductClick(product._id)}>
              View Details →
            </button>
            <button className="banner-btn-secondary" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
              🛒 Add to Cart
            </button>
          </div>
        </div>

        <div className="banner-img-wrap">
          <div className="banner-img-glow" />
          <img src={imgSrc} alt={product.title} className="banner-img" />
        </div>
      </div>

      <button className="banner-arrow banner-arrow-left" onClick={prev} aria-label="Previous">‹</button>
      <button className="banner-arrow banner-arrow-right" onClick={next} aria-label="Next">›</button>

      <div className="banner-tabs">
        {products.map((p, i) => {
          const thumb = Array.isArray(p.productimage) ? p.productimage[0] : p.productimage;
          const label = p.category ? `${p.category}` : p.title;
          return (
            <button
              key={i}
              className={`banner-tab ${i === current ? "banner-tab-active" : ""}`}
              onClick={() => goTo(i)}
              title={p.title}
            >
              <img src={thumb} alt={p.title} className="banner-tab-img" />
              <span className="banner-tab-name">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="banner-progress">
        <div key={current} className="banner-progress-bar" />
      </div>
    </div>
  );
});

/* ─── Promo Banner Card ─── */
const PromoBannerCard = memo(({ tag, title, discount, image, productId, color, onProductClick }) => (
  <div
    onClick={() => productId ? onProductClick(productId) : null}
    className="relative overflow-hidden rounded-2xl cursor-pointer group border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
    style={{ minHeight: 180 }}
  >
    {/* Colored accent top bar */}
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }} />

    <div className="flex items-stretch h-full">
      {/* Text Side */}
      <div className="flex-1 p-5 flex flex-col justify-between z-10">
        <div>
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-2"
            style={{ background: color }}
          >
            {tag}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-3">
            {title}
          </h4>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-lg font-black"
            style={{ color }}
          >
            {discount}
          </span>
          <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
            Explore Now →
          </span>
        </div>
      </div>
      {/* Image Side */}
      {image && (
        <div className="flex-shrink-0 w-28 sm:w-36 relative overflow-hidden bg-slate-50 flex items-center justify-center">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent" />
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
      className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer"
      onClick={() => onProductClick(product._id)}
    >
      <div className="relative w-full h-48 sm:h-52 bg-slate-50 overflow-hidden flex-shrink-0">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-slate-200">📦</div>
        )}
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-sm border border-slate-200 text-indigo-700 shadow-sm">
            {product.category}
          </span>
        )}
        <button
          className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-indigo-700 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          title="Add to Cart"
        >
          🛒
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="text-amber-400 text-xs mb-1">★★★★★</div>
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <span className="text-base font-extrabold text-slate-900">₹{product.price?.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 line-through ml-1.5">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
          </div>
          <button
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onProductClick(product._id); }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
});

/* ─── Feature Card ─── */
const FeatureCard = memo(({ icon, title, desc, accent }) => (
  <div className={`bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${accent || 'bg-indigo-50'}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
));

/* ─── Category Pill ─── */
const CategoryPill = memo(({ name, count, image, icon }) => (
  <Link
    to={`/allproducts?category=${encodeURIComponent(name)}`}
    className="flex items-center gap-3.5 p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
  >
    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center border border-slate-100">
      {image
        ? <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        : <span className="text-2xl">{icon || "📦"}</span>
      }
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{name}</h4>
      <span className="text-[11px] text-slate-500">{count} Product{count !== 1 ? "s" : ""}</span>
    </div>
    <span className="text-slate-400 group-hover:text-indigo-600 transition-colors font-bold text-lg">›</span>
  </Link>
));

/* ─── Testimonial Card ─── */
const TestimonialCard = memo(({ name, role, text, avatar }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300">
    <div className="text-amber-400 text-sm mb-3">★★★★★</div>
    <p className="text-sm text-slate-700 italic leading-relaxed mb-4">"{text}"</p>
    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
        {avatar}
      </div>
      <div>
        <h5 className="text-xs font-bold text-slate-900">{name}</h5>
        <span className="text-[10px] text-slate-500">{role}</span>
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
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={2500} theme="light" />

      {/* ══ NAVBAR ══ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">E-System</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {["Featured", "Banners & Deals", "Categories", "Why Us"].map((item, i) => (
              <a
                key={item}
                href={["#featured", "#posters", "#categories", "#whyus"][i]}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/allproducts" className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
              Browse All
            </Link>
            <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-200">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm transition-all">
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className="text-xl">{mobileNavOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-2 shadow-md">
            <a href="#featured" className="py-2.5 text-sm font-semibold text-slate-700" onClick={() => setMobileNavOpen(false)}>Featured Products</a>
            <a href="#posters" className="py-2.5 text-sm font-semibold text-slate-700" onClick={() => setMobileNavOpen(false)}>Banners & Deals</a>
            <a href="#categories" className="py-2.5 text-sm font-semibold text-slate-700" onClick={() => setMobileNavOpen(false)}>Categories</a>
            <a href="#whyus" className="py-2.5 text-sm font-semibold text-slate-700" onClick={() => setMobileNavOpen(false)}>Why Us</a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" className="py-2.5 px-4 text-center text-sm font-bold text-indigo-600 border border-indigo-200 rounded-xl" onClick={() => setMobileNavOpen(false)}>Sign In</Link>
              <Link to="/register" className="py-2.5 px-4 text-center text-sm font-bold bg-indigo-600 text-white rounded-xl" onClick={() => setMobileNavOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO BANNER CAROUSEL ══ */}
      <section>
        <BannerCarousel
          products={categoryProducts}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </section>

      {/* ══ PROMO BANNERS ══ */}
      <section id="posters" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
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
      <section id="featured" className="bg-slate-50/70 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="🔥 TOP PICKS FOR YOU"
            title="Trending Products"
            desc="Click on any product to view price, details & buy options"
          />

          {loadingProducts ? (
            <LoaderBox text="Fetching products from store..." />
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
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200"
            >
              View All Products →
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
      <section id="whyus" className="bg-slate-50/70 py-14 sm:py-20">
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
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 py-14 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-[10px] font-black uppercase tracking-widest mb-4">
            ⚡ Flash Sale Alerts
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
            Stay Updated With Flash Sales
          </h3>
          <p className="text-indigo-100 text-sm mb-8">
            Subscribe to receive exclusive discount coupons and early access to product releases.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl text-indigo-700 font-bold text-sm">
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
                className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm rounded-xl shadow transition-all cursor-pointer whitespace-nowrap"
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

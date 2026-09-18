import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../store/Usercontext.jsx";
import { API_BASE_URL } from "../config/api.config.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ── Related Product Card ── */
const RelatedProductCard = memo(({ product, onClick }) => {
  const imgSrc = Array.isArray(product.productimage)
    ? product.productimage[0]
    : product.productimage;

  return (
    <div
      onClick={() => onClick(product._id)}
      className="group bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden hover:border-[#10b981] transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
    >
      <div className="relative w-full h-44 sm:h-52 bg-[#181818] overflow-hidden flex-shrink-0 flex items-center justify-center p-3">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span className="text-3xl text-zinc-600">📦</span>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-[#10b981] text-black">
          AURA
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#10b981] transition-colors">
            {product.title}
          </h4>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description || "Luxury design piece"}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
          <span className="text-base font-extrabold text-white">
            ₹{Number(product.price).toLocaleString()}
          </span>
          <span className="text-xs font-bold text-[#10b981] group-hover:translate-x-0.5 transition-transform">
            View →
          </span>
        </div>
      </div>
    </div>
  );
});

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, setCartitem } = useUser();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  /* Extract Array of Images safely */
  const imagesList = useMemo(() => {
    if (!product || !product.productimage) return [];
    if (Array.isArray(product.productimage)) {
      return product.productimage.filter(Boolean);
    }
    return [product.productimage].filter(Boolean);
  }, [product]);

  const activeImage = useMemo(() => {
    if (imagesList.length === 0) return "";
    return imagesList[selectedImgIndex] || imagesList[0];
  }, [imagesList, selectedImgIndex]);

  /* Fetch Product Details */
  const fetchProductDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    setSelectedImgIndex(0);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/product/productget/${id}`
      );
      if (res.data.product) {
        setProduct(res.data.product);
      } else {
        throw new Error("Product data empty");
      }
    } catch (err) {
      console.log("Fetch by ID failed, attempting catalog search fallback:", err);
      try {
        const fallbackRes = await axios.get(
          `${API_BASE_URL}/api/v1/product/productget?limit=100`
        );
        const allList = fallbackRes.data.products || fallbackRes.data.Products || [];
        const found = allList.find((p) => p._id === id);
        if (found) {
          setProduct(found);
        } else {
          setError("Product not found or has been removed.");
        }
      } catch (fallbackErr) {
        setError("Unable to load product details. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* Fetch Related Products */
  const fetchRelated = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/product/productget?limit=8`
      );
      const all = res.data.products || res.data.Products || [];
      setRelatedProducts(all.filter((p) => p._id !== id));
    } catch (err) {
      console.log("Failed to load related products:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetail();
    fetchRelated();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProductDetail, fetchRelated]);

  /* Add To Cart Handler */
  const handleAddToCart = useCallback(async () => {
    if (!token) {
      toast.info("Please login to add items to bag!");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    if (!product) return;
    setAdding(true);

    try {
      const payload = {
        itemimage: product.productimage,
        productid: product._id,
        producttitle: product.title,
        productprice: product.price,
        productdescription: product.description,
        quantity,
      };

      await axios.post(
        `${API_BASE_URL}/api/v1/cartdata/cartitem`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Added to Bag successfully! 🛍️", { autoClose: 1200 });

      const cartRes = await axios.get(
        `${API_BASE_URL}/api/v1/cartdata/cartget`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartitem(cartRes.data.cart || cartRes.data.card || []);
    } catch (err) {
      console.log("Add to cart error:", err);
      toast.error("Failed to add to bag.");
    } finally {
      setAdding(false);
    }
  }, [token, product, quantity, navigate, setCartitem]);

  const handleBuyNow = useCallback(() => {
    if (!token) {
      toast.info("Please login to proceed with purchase!");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    if (!product) return;
    navigate("/checkout", { state: { directBuyItem: product, quantity } });
  }, [token, product, quantity, navigate]);

  const handleRelatedClick = useCallback((relId) => {
    navigate(`/product/${relId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 mt-16">
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-zinc-400 mb-6 sm:mb-8 bg-[#1e1e1e] border border-white/10 rounded-2xl px-4 py-3 shadow-sm w-fit uppercase tracking-wider">
          <Link to="/" className="hover:text-[#10b981] transition-colors font-medium">Home</Link>
          <span className="text-zinc-600">/</span>
          <Link to="/allproducts" className="hover:text-[#10b981] transition-colors font-medium">Products</Link>
          <span className="text-zinc-600">/</span>
          <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[350px]">
            {product ? product.title : "Product Details"}
          </span>
        </nav>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#1e1e1e] border border-white/10 rounded-3xl shadow-sm">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#10b981] rounded-full animate-spin" />
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">Loading product details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 px-6 bg-[#1e1e1e] border border-rose-500/30 rounded-3xl shadow-sm max-w-lg mx-auto space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{error}</h2>
            <button
              onClick={() => navigate("/allproducts")}
              className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              Back to Catalog →
            </button>
          </div>
        )}

        {/* Product Details Section */}
        {!loading && !error && product && (
          <div className="space-y-12">
            <div className="bg-[#1e1e1e] border border-white/10 rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Image Showcase Gallery */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#181818] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center group shadow-inner p-4">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-6xl text-zinc-600">📦</div>
                  )}

                  {product.category && (
                    <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#10b981] text-black shadow-md">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Thumbnails list if multiple images */}
                {imagesList.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {imagesList.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImgIndex(idx)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-[#181818] transition-all flex-shrink-0 cursor-pointer p-1 ${
                          idx === selectedImgIndex
                            ? "border-[#10b981] ring-2 ring-[#10b981]/30 scale-95"
                            : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Information & Purchase Controls */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/10 text-[#10b981]">
                      💎 Verified Luxury Quality
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> In Stock
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight font-['Outfit']">
                    {product.title}
                  </h1>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <div className="flex text-amber-400 font-bold">★★★★★</div>
                    <span className="font-semibold text-white">4.9</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">128 Verified Customer Reviews</span>
                  </div>

                  {/* Price Banner */}
                  <div className="p-4 bg-[#181818] border border-white/10 rounded-2xl flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      ₹{Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-zinc-500 line-through">
                      ₹{Math.round(product.price * 1.25).toLocaleString()}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#10b981] text-black">
                      20% OFF
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Description</h3>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {product.description ||
                        "Experience unmatched audio and acoustic craftsmanship with this premium design piece."}
                    </p>
                  </div>
                </div>

                {/* Quantity Selector & Live Subtotal */}
                <div className="space-y-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between gap-4 flex-wrap bg-[#181818] p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider">Quantity:</span>
                      <div className="flex items-center bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-3.5 py-1.5 text-white hover:text-[#10b981] font-bold text-base transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 font-black text-sm text-white min-w-[36px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => q + 1)}
                          className="px-3.5 py-1.5 text-white hover:text-[#10b981] font-bold text-base transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400 font-medium block uppercase tracking-wider">Total Price:</span>
                      <span className="text-lg sm:text-xl font-extrabold text-[#10b981]">
                        ₹{(product.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="w-full py-4 px-6 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🛒</span>
                      <span>{adding ? "ADDING..." : "ADD TO BAG"}</span>
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-4 px-6 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>⚡</span>
                      <span>BUY NOW</span>
                    </button>
                  </div>

                  {/* Trust Perks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181818] border border-white/5">
                      <span className="text-xl">🚚</span>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Free Express Delivery</h4>
                        <p className="text-[10px] text-zinc-400">Ships within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181818] border border-white/5">
                      <span className="text-xl">🛡️</span>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Brand Warranty</h4>
                        <p className="text-[10px] text-zinc-400">100% Genuine product</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181818] border border-white/5">
                      <span className="text-xl">🔄</span>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Easy Return</h4>
                        <p className="text-[10px] text-zinc-400">Hassle-free exchange</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Related Products Carousel / Grid */}
            {relatedProducts.length > 0 && (
              <section className="space-y-6 pt-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981] block mb-1">
                      RECOMMENDED
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-['Outfit']">
                      You Might Also Like
                    </h3>
                  </div>
                  <Link
                    to="/allproducts"
                    className="text-xs sm:text-sm font-bold text-[#10b981] hover:underline transition-colors uppercase tracking-wider"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {relatedProducts.slice(0, 4).map((rel) => (
                    <RelatedProductCard
                      key={rel._id}
                      product={rel}
                      onClick={handleRelatedClick}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetail;

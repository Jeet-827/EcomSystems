import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaCheckCircle,
  FaShareAlt,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaBolt,
} from "react-icons/fa";

/* ── Related Product Card ── */
const RelatedProductCard = memo(({ product, onClick, onAddToCart }) => {
  const imgSrc = Array.isArray(product.productimage)
    ? product.productimage[0]
    : product.productimage || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";

  return (
    <div
      onClick={() => onClick(product._id)}
      className="group card-tech p-4 flex flex-col justify-between cursor-pointer bg-white border border-slate-200 hover:border-indigo-300"
    >
      <div className="relative w-full h-36 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="space-y-1">
        <span className="text-[9px] uppercase font-bold text-slate-400">{product.category || "Tech"}</span>
        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#4f46e5]">
          {product.title}
        </h4>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-black text-slate-900 font-['Outfit']">
            ₹{Number(product.price).toLocaleString()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-1.5 rounded-lg bg-indigo-50 text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white transition-colors"
          >
            <FaShoppingCart size={11} />
          </button>
        </div>
      </div>
    </div>
  );
});

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, setCartitem, isInWishlist, toggleWishlist } = useUser();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const imagesList = useMemo(() => {
    if (!product || !product.productimage) return [];
    if (Array.isArray(product.productimage)) {
      return product.productimage.filter(Boolean);
    }
    return [product.productimage].filter(Boolean);
  }, [product]);

  const activeImage = useMemo(() => {
    if (imagesList.length === 0) return "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";
    return imagesList[selectedImgIndex] || imagesList[0];
  }, [imagesList, selectedImgIndex]);

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
      }
    } catch {
      setError("Product not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRelated = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget`);
      const all = res.data.products || res.data.Products || [];
      setRelatedProducts(all.filter((p) => p._id !== id).slice(0, 4));
    } catch {
      // silent
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetail();
    fetchRelated();
  }, [fetchProductDetail, fetchRelated]);

  const handleAddToCart = useCallback(async () => {
    if (!token) {
      toast.info("Please sign in to add items to bag!");
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
        quantity,
      };
      await axios.post(`${API_BASE_URL}/api/v1/cartdata/cartitem`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Added to Shopping Bag! 🛍️", { autoClose: 900 });
      const cartRes = await axios.get(`${API_BASE_URL}/api/v1/cartdata/cartget`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartitem(cartRes.data.cart || []);
    } catch {
      toast.error("Failed to add to bag.");
    }
  }, [token, product, quantity, navigate, setCartitem]);

  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    navigate("/cart");
  }, [handleAddToCart, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <div className="spinner-purple" />
          <p className="text-slate-400 text-xs font-bold uppercase">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Product Not Found</h2>
          <button
            onClick={() => navigate("/allproducts")}
            className="px-6 py-2.5 btn-purple-primary text-xs font-bold uppercase"
          >
            Return to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-[#4f46e5]">Home</Link>
          <FaChevronRight size={8} />
          <Link to="/allproducts" className="hover:text-[#4f46e5]">Catalog</Link>
          <FaChevronRight size={8} />
          <span className="text-slate-800 font-bold truncate max-w-xs">{product.title}</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Product Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Active Big Image */}
            <div className="w-full h-80 sm:h-96 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
              <span className="badge-featured absolute top-4 left-4">VERIFIED HARDWARE</span>
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Thumbnail selector */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 rounded-xl bg-slate-50 border-2 p-1.5 flex-shrink-0 cursor-pointer transition-all ${
                      selectedImgIndex === idx
                        ? "border-[#4f46e5] shadow-sm scale-105"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Buy Info */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge-category">{product.category || "Gadget"}</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <FaCheckCircle size={11} /> In Stock & Ready to Ship
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-2 text-amber-400 text-xs pt-1">
                <div className="flex">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <span className="text-slate-500 font-semibold">(4.9 • 85 Customer Reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-['Outfit']">
                ₹{Number(product.price).toLocaleString()}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ₹{Number(Math.round(product.price * 1.25)).toLocaleString()}
              </span>
              <span className="badge-discount text-[10px] ml-auto">SAVE 20%</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description || "Engineered for excellence. Experience superior performance, intuitive interface, and durable premium craftsmanship."}
            </p>

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase text-slate-400">Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-slate-600 hover:text-[#4f46e5] cursor-pointer"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="px-4 font-black text-xs text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 text-slate-600 hover:text-[#4f46e5] cursor-pointer"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
                <span className="text-xs text-slate-400">Total: <strong className="text-slate-900">₹{(Number(product.price) * quantity).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 btn-purple-primary text-xs font-black uppercase tracking-wider gap-2 shadow-md"
              >
                <FaShoppingCart size={13} />
                <span>Add To Bag</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <FaBolt size={12} className="text-amber-400" />
                <span>Buy Now</span>
              </button>
              <button
                onClick={() => {
                  const added = toggleWishlist(product);
                  if (added) toast.success("Added to Wishlist! ❤️", { autoClose: 800 });
                  else toast.info("Removed from Wishlist", { autoClose: 700 });
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isInWishlist(product._id)
                    ? "bg-rose-50 border-rose-200 text-rose-500 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                }`}
                title={isInWishlist(product._id) ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <FaHeart size={16} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <FaTruck className="mx-auto text-[#4f46e5]" size={14} />
                <span className="text-[10px] font-bold text-slate-700 block">Free Shipping</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <FaUndo className="mx-auto text-emerald-600" size={14} />
                <span className="text-[10px] font-bold text-slate-700 block">90 Days Return</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <FaShieldAlt className="mx-auto text-indigo-600" size={14} />
                <span className="text-[10px] font-bold text-slate-700 block">2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200">
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  activeTab === tab
                    ? "border-[#4f46e5] text-[#4f46e5]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              <p>
                {product.description || "Built with aerospace-grade precision and ultra-refined materials. Designed to seamlessly fit into your smart ecosystem while delivering unrivaled performance."}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>High efficiency architecture with optimized power consumption</li>
                <li>Studio-calibrated performance tuned for high dynamic fidelity</li>
                <li>Plug-and-play seamless compatibility with all modern devices</li>
                <li>Comprehensive 24/7 technical hotline and warranty guarantee</li>
              </ul>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl text-xs">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-400">Category</span>
                <span className="font-bold text-slate-800 uppercase">{product.category || "Hardware"}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-400">Warranty</span>
                <span className="font-bold text-slate-800">2 Years Official</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-400">Connectivity</span>
                <span className="font-bold text-slate-800">Wi-Fi 6 / Bluetooth 5.3</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-400">Build Material</span>
                <span className="font-bold text-slate-800">Anodized Aluminum & Glass</span>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="text-3xl font-black text-slate-900 font-['Outfit']">4.9</div>
                <div>
                  <div className="flex text-amber-400 text-xs">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Based on 85 verified customer reviews</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Alex Chen</span>
                    <span className="text-[10px] text-slate-400">2 days ago</span>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <p className="text-xs text-slate-600">
                    "Phenomenal build quality and fast delivery. Exceeded all my expectations!"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <RelatedProductCard
                  key={p._id}
                  product={p}
                  onClick={(id) => navigate(`/product/${id}`)}
                  onAddToCart={(p) => {
                    handleAddToCart();
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetail;

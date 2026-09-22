import { useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../store/Usercontext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaShoppingCart,
  FaTrashAlt,
  FaArrowRight,
  FaStar,
  FaChevronRight,
  FaBoxOpen,
  FaMobileAlt,
  FaLaptop,
  FaHeadphones,
  FaGamepad,
} from "react-icons/fa";

function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist, token, setCartitem } = useUser();
  const navigate = useNavigate();

  const handleAddToCart = useCallback(
    async (product, e) => {
      if (e) e.stopPropagation();
      if (!token) {
        toast.info("Please sign in to add items to your cart!");
        setTimeout(() => navigate("/login"), 800);
        return;
      }
      try {
        const payload = {
          itemimage: product.productimage,
          productid: product._id || product.id,
          producttitle: product.title,
          productprice: product.price,
          productdescription: product.description,
        };
        await axios.post(`${API_BASE_URL}/api/v1/cartdata/cartitem`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`"${product.title.slice(0, 24)}..." added to bag! 🛍️`, {
          autoClose: 1000,
        });
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

  const handleMoveAllToCart = useCallback(async () => {
    if (!token) {
      toast.info("Please sign in to add items to your cart!");
      setTimeout(() => navigate("/login"), 800);
      return;
    }
    if (wishlist.length === 0) return;

    let addedCount = 0;
    for (const product of wishlist) {
      try {
        const payload = {
          itemimage: product.productimage,
          productid: product._id || product.id,
          producttitle: product.title,
          productprice: product.price,
          productdescription: product.description,
        };
        await axios.post(`${API_BASE_URL}/api/v1/cartdata/cartitem`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        addedCount++;
      } catch {}
    }

    if (addedCount > 0) {
      toast.success(`Moved ${addedCount} items to your bag! 🛍️`, { autoClose: 1200 });
      try {
        const cartRes = await axios.get(`${API_BASE_URL}/api/v1/cartdata/cartget`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartitem(cartRes.data.cart || []);
      } catch {}
    } else {
      toast.error("Could not add items to cart.");
    }
  }, [token, wishlist, navigate, setCartitem]);

  const totalWishlistValue = useMemo(() => {
    return wishlist.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Outfit']">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Breadcrumbs ── */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <FaChevronRight size={10} />
          <span className="text-slate-700">Wishlist</span>
        </div>

        {/* ── Header Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Wishlist
              </h1>
              <span className="px-3 py-1 bg-indigo-50 text-[#4f46e5] text-xs font-extrabold rounded-full border border-indigo-100">
                {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Save your favorite gadgets, compare specs, and move them to your bag anytime.
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearWishlist}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <FaTrashAlt size={12} />
                <span>Clear All</span>
              </button>
              <button
                onClick={handleMoveAllToCart}
                className="px-5 py-2.5 btn-purple-primary text-xs font-bold gap-2 cursor-pointer shadow-md"
              >
                <FaShoppingCart size={13} />
                <span>Move All to Bag</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Wishlist Content ── */}
        {wishlist.length === 0 ? (
          /* Empty Wishlist State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-16 text-center shadow-sm max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
              <FaHeart size={36} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
              Explore our tech catalog and tap the heart icon on any device to save it here for later.
            </p>

            <Link
              to="/allproducts"
              className="inline-flex items-center gap-2 px-8 py-3.5 btn-purple-primary font-bold text-sm rounded-2xl shadow-lg hover:shadow-indigo-200 transition-all mb-10"
            >
              <span>Explore Tech Catalog</span>
              <FaArrowRight size={13} />
            </Link>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Popular Categories to Explore
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <Link
                  to="/allproducts?category=mobile"
                  className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-[#4f46e5] text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <FaMobileAlt size={12} /> Smartphones
                </Link>
                <Link
                  to="/allproducts?category=laptop"
                  className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-[#4f46e5] text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <FaLaptop size={12} /> Laptops
                </Link>
                <Link
                  to="/allproducts?category=audio"
                  className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-[#4f46e5] text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <FaHeadphones size={12} /> Audio Gear
                </Link>
                <Link
                  to="/allproducts?category=gaming"
                  className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-[#4f46e5] text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <FaGamepad size={12} /> Gaming & VR
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((elem) => {
                const pId = elem._id || elem.id;
                const imgSrc = Array.isArray(elem.productimage)
                  ? elem.productimage[0]
                  : elem.productimage ||
                    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";

                return (
                  <div
                    key={pId}
                    onClick={() => navigate(`/product/${pId}`)}
                    className="group card-tech flex flex-col justify-between cursor-pointer bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 p-4 rounded-2xl relative"
                  >
                    {/* Top Badges & Remove Button */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                        In Stock
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(pId);
                          toast.info("Removed from wishlist", { autoClose: 700 });
                        }}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <FaTrashAlt size={12} />
                      </button>
                    </div>

                    {/* Product Image */}
                    <div className="w-full h-48 bg-slate-50 rounded-xl overflow-hidden mb-4 p-3 flex items-center justify-center">
                      <img
                        src={imgSrc}
                        alt={elem.title}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Meta info */}
                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="badge-category mb-1.5 inline-block">
                          {elem.category || "Hardware"}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4f46e5] transition-colors line-clamp-2 leading-snug">
                          {elem.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {elem.description || "High-performance tech hardware built with premium components."}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
                          <FaStar size={11} />
                          <FaStar size={11} />
                          <FaStar size={11} />
                          <FaStar size={11} />
                          <FaStar size={11} />
                          <span className="text-slate-400 text-[10px] ml-1 font-semibold">
                            (4.9)
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              Price
                            </span>
                            <span className="text-lg font-black text-slate-900 font-['Outfit']">
                              ₹{Number(elem.price).toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleAddToCart(elem, e)}
                            className="px-4 py-2.5 btn-purple-primary text-xs font-bold gap-2 cursor-pointer shadow-md hover:scale-105 transition-transform"
                          >
                            <span>Add to Bag</span>
                            <FaShoppingCart size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total value info bar */}
            <div className="mt-12 bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center">
                  <FaBoxOpen size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Wishlist Total Value
                  </h4>
                  <p className="text-xs text-slate-500">
                    {wishlist.length} item(s) ready to checkout
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Combined Total
                  </span>
                  <span className="text-xl font-black text-[#4f46e5]">
                    ₹{totalWishlistValue.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleMoveAllToCart}
                  className="px-6 py-3 btn-purple-primary text-xs font-bold gap-2 shadow-lg cursor-pointer"
                >
                  <FaShoppingCart size={13} />
                  <span>Move All to Bag</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;

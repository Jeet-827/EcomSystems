import { useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowRight,
  FaShieldAlt,
  FaTruck,
  FaShoppingBag,
} from "react-icons/fa";

function Cart() {
  const { setCartitem, cartitem, token } = useUser();
  const navigate = useNavigate();

  const CartApi = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/cartdata/cartget`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartitem(res.data.cart || []);
    } catch {
      // silent
    }
  }, [token, setCartitem]);

  useEffect(() => {
    if (token) CartApi();
  }, [CartApi, token]);

  const handleRemoveItem = useCallback(
    async (itemId) => {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/v1/cartdata/cartitem/${itemId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartitem((prev) => prev.filter((item) => item._id !== itemId));
        toast.success("Item removed from bag!", { autoClose: 600 });
      } catch {
        toast.error("Failed to remove item.");
      }
    },
    [token, setCartitem]
  );

  const handleQuantityChange = useCallback(
    (itemId, delta) => {
      setCartitem((prevCart) =>
        prevCart.map((item) => {
          if (item._id === itemId) {
            const currentQty = item.quantity || 1;
            const newQty = Math.max(1, currentQty + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
      );
    },
    [setCartitem]
  );

  const { subtotal, shipping, discount, total } = useMemo(() => {
    const subtotal = cartitem.reduce(
      (sum, item) =>
        sum + (Number(item.productprice) || 0) * (item.quantity || 1),
      0
    );
    const shipping = subtotal > 1500 ? 0 : 99;
    const discount = 0;
    return { subtotal, shipping, discount, total: subtotal + shipping - discount };
  }, [cartitem]);

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shopping Cart
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              Your Shopping Bag ({cartitem.length})
            </h1>
          </div>

          <Link
            to="/allproducts"
            className="text-xs font-bold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1"
          >
            Continue Shopping ›
          </Link>
        </div>

        {cartitem.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="text-6xl text-indigo-300">🛍️</div>
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Your bag is currently empty</h2>
            <p className="text-slate-500 text-xs">
              Explore our tech catalog to find high-performance gadgets and smart gear.
            </p>
            <button
              onClick={() => navigate("/allproducts")}
              className="px-8 py-3.5 btn-purple-primary text-xs font-bold uppercase tracking-wider"
            >
              Explore Catalog Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartitem.map((item) => {
                const imgSrc = Array.isArray(item.itemimage)
                  ? item.itemimage[0]
                  : item.itemimage || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";

                const qty = item.quantity || 1;
                const itemTotal = (Number(item.productprice) || 0) * qty;

                return (
                  <div
                    key={item._id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 flex items-center justify-center border border-slate-100 flex-shrink-0">
                        <img
                          src={imgSrc}
                          alt={item.producttitle}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] line-clamp-1">
                          {item.producttitle}
                        </h3>
                        <p className="text-xs font-black text-[#4f46e5]">
                          ₹{Number(item.productprice).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector & Item Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Qty Box */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          className="p-2 text-slate-600 hover:text-[#4f46e5] cursor-pointer"
                        >
                          <FaMinus size={9} />
                        </button>
                        <span className="px-3 font-bold text-xs text-slate-900">{qty}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="p-2 text-slate-600 hover:text-[#4f46e5] cursor-pointer"
                        >
                          <FaPlus size={9} />
                        </button>
                      </div>

                      {/* Total */}
                      <span className="text-sm font-black text-slate-900 w-24 text-right">
                        ₹{itemTotal.toLocaleString()}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Order Summary Card */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-['Outfit'] border-b border-slate-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-emerald-600">
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-[10px] text-emerald-600 font-bold">
                      ✓ Free Express Shipping Applied
                    </p>
                  )}
                  <div className="flex justify-between pt-3 border-t border-slate-100 text-sm font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-lg text-[#4f46e5]">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3.5 btn-purple-primary text-xs font-black uppercase tracking-wider gap-2 shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <FaArrowRight size={12} />
                </button>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-indigo-600" />
                    <span>SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaTruck className="text-indigo-600" />
                    <span>Express Dispatch within 24h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;

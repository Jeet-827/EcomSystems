import { useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

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
        const res = await axios.delete(
          `${API_BASE_URL}/api/v1/cartdata/cartitem/${itemId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartitem(res.data.cart || []);
        toast.success("Item removed from cart!", { autoClose: 500 });
      } catch {
        toast.error("Failed to remove item.");
      }
    },
    [token, setCartitem]
  );

  /* Quantity increase / decrease handler */
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

  /* Memoised totals — only recalculates when cartitem changes */
  const { subtotal, shipping, total } = useMemo(() => {
    const subtotal = cartitem.reduce(
      (sum, item) =>
        sum + (Number(item.productprice) || 0) * (item.quantity || 1),
      0
    );
    const shipping = 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cartitem]);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 mt-16">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-widest font-['Outfit'] uppercase">
            YOUR SHOPPING BAG
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mt-1">
            {cartitem.length === 1 ? "1 item" : `${cartitem.length} items`} in your luxury bag
          </p>
        </div>

        {cartitem.length === 0 ? (
          <div className="bg-[#1e1e1e] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-2xl">
            <div className="text-6xl text-zinc-600">🛍️</div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider font-['Outfit']">Your bag is empty</h2>
            <p className="text-zinc-400 text-xs uppercase tracking-widest">
              Explore our luxury acoustic and lifestyle collection to fill your bag.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer inline-block mt-2"
            >
              START SHOPPING
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartitem.map((item) => {
                const qty = item.quantity || 1;
                const itemTotal = (Number(item.productprice) || 0) * qty;

                return (
                  <div
                    className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm hover:border-[#10b981]/50 transition-all"
                    key={item._id}
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#181818] rounded-xl border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-2">
                      <img
                        src={item.itemimage}
                        alt={item.producttitle}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white line-clamp-1">
                          {item.producttitle}
                        </h3>
                        <button
                          className="text-zinc-500 hover:text-rose-400 transition-colors text-base p-1 cursor-pointer"
                          onClick={() => handleRemoveItem(item._id)}
                          title="Remove Item"
                        >
                          🗑️
                        </button>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {item.productdescription || "Luxury design piece."}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <span className="text-sm font-extrabold text-[#10b981]">
                          ₹{Number(item.productprice).toLocaleString()}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-[#121212] border border-white/10 px-3 py-1 rounded-xl">
                          <button
                            className="text-white hover:text-[#10b981] disabled:opacity-30 disabled:hover:text-white font-bold text-base px-1 cursor-pointer"
                            onClick={() => handleQuantityChange(item._id, -1)}
                            disabled={qty <= 1}
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-xs font-bold text-white min-w-[20px] text-center">{qty}</span>
                          <button
                            className="text-white hover:text-[#10b981] font-bold text-base px-1 cursor-pointer"
                            onClick={() => handleQuantityChange(item._id, 1)}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Calculated Subtotal */}
                        <span className="text-xs text-zinc-300 font-semibold">
                          Total: <span className="font-extrabold text-white text-sm">₹{itemTotal.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-[#1e1e1e] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl sticky top-24">
                <h2 className="text-lg font-black text-white uppercase tracking-widest font-['Outfit']">ORDER SUMMARY</h2>

                <div className="space-y-3 text-xs uppercase tracking-wider border-b border-white/10 pb-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span className="font-bold text-[#10b981]">
                      {shipping === 0 ? "FREE EXPRESS" : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-black text-white uppercase tracking-wider">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#10b981]">₹{total.toLocaleString()}</span>
                </div>

                <button
                  className="w-full py-4 bg-[#10b981] hover:bg-[#059669] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  onClick={() => navigate("/checkout")}
                >
                  <span>⚡</span>
                  <span>PROCEED TO CHECKOUT</span>
                </button>

                <div className="text-center">
                  <button
                    onClick={() => navigate("/home")}
                    className="text-xs text-zinc-400 hover:text-white uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                  >
                    ← Continue Shopping
                  </button>
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

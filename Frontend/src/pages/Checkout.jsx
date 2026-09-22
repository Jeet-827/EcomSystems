import { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaLock,
  FaTruck,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

const RAZOR_KEY = "rzp_test_TZQOZ3uu5gp2Yy";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (document.getElementById("rzp-sdk")) return resolve(true);
    const s = document.createElement("script");
    s.id = "rzp-sdk";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Checkout() {
  const { user, cartitem, setCartitem, token } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const directBuyItem = location.state?.directBuyItem;
  const directQuantity = location.state?.quantity || 1;

  const [formData, setFormData] = useState({
    houseNo: "",
    street: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    phonenumber: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncCart = async () => {
      if (token && !directBuyItem) {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/v1/cartdata/cartget`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const cartList = res.data.cart || res.data.card || [];
          setCartitem(cartList);
        } catch {
          // silent
        }
      }
    };
    syncCart();
  }, [token, directBuyItem, setCartitem]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validateAddress = () => {
    const required = [
      { key: "houseNo", label: "House / Flat No" },
      { key: "street", label: "Street / Colony" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
      { key: "pincode", label: "Pincode" },
      { key: "phonenumber", label: "Phone Number" },
    ];
    for (const { key, label } of required) {
      if (!formData[key] || !String(formData[key]).trim()) {
        toast.error(`${label} is required.`);
        return false;
      }
    }
    if (String(formData.pincode).length !== 6) {
      toast.error("Pincode must be exactly 6 digits.");
      return false;
    }
    if (String(formData.phonenumber).length < 10) {
      toast.error("Phone number must be at least 10 digits.");
      return false;
    }
    return true;
  };

  const checkoutItems = useMemo(() => {
    if (directBuyItem) {
      const imgSrc = Array.isArray(directBuyItem.productimage)
        ? directBuyItem.productimage[0]
        : directBuyItem.productimage;
      return [
        {
          _id: directBuyItem._id,
          productid: directBuyItem._id,
          producttitle: directBuyItem.title,
          productprice: directBuyItem.price,
          itemimage: imgSrc,
          quantity: directQuantity,
        },
      ];
    }
    return cartitem || [];
  }, [directBuyItem, directQuantity, cartitem]);

  const orderTotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + (Number(item.productprice) || 0) * (item.quantity || 1),
        0
      ),
    [checkoutItems]
  );

  const saveOrder = async (paymentStatus) => {
    const productIds = checkoutItems.map((item) => item.productid || item._id);
    await axios.post(
      `${API_BASE_URL}/api/v1/order/ordercreate`,
      {
        userid: user?._id,
        productid: productIds,
        address: [
          {
            houseNo: formData.houseNo,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
          },
        ],
        phonenumber: Number(formData.phonenumber),
        payment: paymentStatus,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!checkoutItems || checkoutItems.length === 0) {
        toast.error("Your cart is empty! Please add products to cart first.");
        return;
      }
      if (!validateAddress()) return;
      setLoading(true);
      try {
        await saveOrder("unpaid");
        toast.success("Order Placed with Cash on Delivery!");
        if (!directBuyItem) setCartitem([]);
        setTimeout(() => navigate("/profile"), 1500);
      } catch {
        toast.error("Failed to place order. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkoutItems, directBuyItem, user, formData, token, navigate, setCartitem]
  );

  const handleRazorpay = async () => {
    if (!checkoutItems || checkoutItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    if (!validateAddress()) return;
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Razorpay failed to load.");
        setLoading(false);
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/make/payment`,
        { amount: orderTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: RAZOR_KEY,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "TREO Tech Store",
        order_id: data.order.id,
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: formData.phonenumber || "9876543210",
        },
        theme: { color: "#4f46e5" },
        handler: async () => {
          try {
            await saveOrder("paid");
            toast.success("Payment Successful! Order Confirmed.");
            if (!directBuyItem) setCartitem([]);
            setTimeout(() => navigate("/profile"), 1500);
          } catch {
            toast.error("Payment done but order save failed.");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        toast.error(r.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch {
      toast.error("Could not initiate payment.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6fb] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/cart" className="hover:text-[#4f46e5]">Cart</Link>
              <span>›</span>
              <span className="text-slate-800 font-bold">Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              Complete Your Order
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <FaLock size={11} /> 256-Bit SSL Encrypted
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Shipping Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase font-['Outfit'] pb-3 border-b border-slate-100">
                  <FaMapMarkerAlt className="text-[#4f46e5]" />
                  <span>Delivery Address</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase">
                      House No / Flat
                    </label>
                    <input
                      type="text"
                      name="houseNo"
                      value={formData.houseNo}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 101, A-Wing"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4f46e5] text-slate-900 placeholder-slate-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase">
                      Street / Colony
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      placeholder="e.g. MG Road"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4f46e5] text-slate-900 placeholder-slate-400 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="City"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4f46e5] text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="State"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4f46e5] text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      maxLength="6"
                      placeholder="6-digit PIN"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4f46e5] text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase">
                    Phone Number (for delivery updates)
                  </label>
                  <input
                    type="tel"
                    name="phonenumber"
                    value={formData.phonenumber}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4f46e5] text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase font-['Outfit'] pb-3 border-b border-slate-100">
                  Select Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Razorpay Button */}
                  <button
                    type="button"
                    onClick={handleRazorpay}
                    disabled={loading || checkoutItems.length === 0}
                    className="p-4 rounded-2xl border-2 border-[#4f46e5] bg-indigo-50/50 hover:bg-indigo-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <FaCreditCard size={22} className="text-[#4f46e5]" />
                    <span className="text-xs font-black text-slate-900 uppercase">
                      Pay Online (Razorpay)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      UPI, Credit/Debit Cards, NetBanking
                    </span>
                  </button>

                  {/* COD Button */}
                  <button
                    type="submit"
                    disabled={loading || checkoutItems.length === 0}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <FaMoneyBillWave size={22} className="text-emerald-600" />
                    <span className="text-xs font-black text-slate-900 uppercase">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Pay cash upon package arrival
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit'] border-b border-slate-100 pb-3">
                Items in Order ({checkoutItems.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 pt-2">
                    <img
                      src={item.itemimage}
                      alt={item.producttitle}
                      className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.producttitle}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      ₹{Number(item.productprice * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{orderTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-lg text-[#4f46e5]">₹{orderTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;

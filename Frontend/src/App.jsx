import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "./store/Usercontext";
import { API_BASE_URL } from "./config/api.config.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ── Lazy-loaded page components ── */
const Landing     = lazy(() => import("./pages/Landing"));
const Login       = lazy(() => import("./pages/Login"));
const Register    = lazy(() => import("./pages/Register"));
const Home        = lazy(() => import("./pages/Home"));
const Allproducts = lazy(() => import("./pages/AllProducts"));
const Cart        = lazy(() => import("./pages/Cart"));
const Checkout    = lazy(() => import("./pages/Checkout"));
const Profile     = lazy(() => import("./pages/Profile"));
const SearchPage  = lazy(() => import("./pages/SearchPage"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ProtectRoute = lazy(() => import("./ProtectRoute"));
const Protectadmin = lazy(() => import("./Admin/Protectadmin"));

/* ── Admin pages (lazy) ── */
const Dashboard       = lazy(() => import("./Admin/Dashboard"));
const Orders          = lazy(() => import("./Admin/Orders"));
const OrderDetail     = lazy(() => import("./Admin/OrderDetail"));
const Admin           = lazy(() => import("./Admin/Admin"));
const Manageorder     = lazy(() => import("./Admin/Manageproduct"));
const Customersmanage = lazy(() => import("./Admin/Customersmanage"));
const Settings        = lazy(() => import("./Admin/Settings"));
const Logout          = lazy(() => import("./Admin/Logout"));
const EditProduct     = lazy(() => import("./Admin/EditProduct"));

/* ── Full-screen suspense fallback ── */
function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-medium tracking-wide">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const { user, token, setToken, setCartitem } = useUser();

  /* Silently refresh access token every 14 min */
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/v1/tokenData/token`,
          {},
          { withCredentials: true }
        );
        setToken(res.data.accessToken);
      } catch (err) {

      }
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, setToken]);

  /* Fetch cart on mount / login */
  const fetchCart = useCallback(async () => {
    if (!token || !user) { setCartitem([]); return; }
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/cartdata/cartget`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartitem(res.data.cart || []);
    } catch (err) {

    }
  }, [token, user, setCartitem]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  return (
    <Suspense fallback={<PageLoader />}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/allproducts" element={<Allproducts />} />

        {/* Protected Admin routes */}
        <Route element={<Protectadmin />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/order" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/allproduct" element={<Manageorder />} />
          <Route path="/customersmanage" element={<Customersmanage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/editproduct/:id" element={<EditProduct />} />
        </Route>

        {/* Protected user routes */}
        <Route element={<ProtectRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import {
  FaShoppingCart,
  FaHeart,
  FaSignOutAlt,
  FaHome,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaFire,
  FaChevronDown,
} from "react-icons/fa";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "mobile", label: "Smartphones & Tablets" },
  { id: "laptop", label: "Laptops & PC Gaming" },
  { id: "audio", label: "Headphones & Speakers" },
  { id: "watch", label: "Smart Watches & Wearables" },
  { id: "camera", label: "Cameras & Drones" },
  { id: "gaming", label: "Gaming & VR" },
  { id: "tv", label: "TV & Smart Displays" },
  { id: "appliances", label: "Home & Kitchen Appliances" },
];

function Navbar() {
  const { user, cartitem, wishlist, logout } = useUser();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Debounced search
  useEffect(() => {
    const fetchSearch = async () => {
      const queryToUse = searchTerm.trim() || (selectedCategory !== "all" ? selectedCategory : "");
      if (!queryToUse) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/search/search?q=${encodeURIComponent(queryToUse)}`
        );
        let results = res.data.products || [];
        if (selectedCategory !== "all" && searchTerm.trim()) {
          results = results.filter((p) =>
            p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
          );
        }
        setSearchResults(results);
        setShowDropdown(true);
      } catch {
        // silent
      }
    };
    const t = setTimeout(fetchSearch, 250);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory]);

  const handleSearchSubmit = useCallback(() => {
    const q = searchTerm.trim() || (selectedCategory !== "all" ? selectedCategory : "");
    if (q) {
      setShowDropdown(false);
      setMenuOpen(false);
      if (selectedCategory !== "all" && !searchTerm.trim()) {
        navigate(`/allproducts?category=${encodeURIComponent(selectedCategory)}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(q)}`);
      }
    }
  }, [searchTerm, selectedCategory, navigate]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setShowDropdown(false);
    setShowCategoryMenu(false);
    if (catId !== "all" && !searchTerm) {
      navigate(`/allproducts?category=${encodeURIComponent(catId)}`);
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearchSubmit();
    },
    [handleSearchSubmit]
  );

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const totalCartPrice = cartitem.reduce(
    (sum, item) => sum + (Number(item.productprice) || 0) * (item.quantity || 1),
    0
  );

  const mobileNavLinks = (
    <div className="flex flex-col space-y-1.5 text-xs font-bold text-slate-700">
      <Link
        to="/"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        onClick={closeMenu}
      >
        <FaHome className="text-indigo-600" /> Home
      </Link>
      <Link
        to="/allproducts"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        onClick={closeMenu}
      >
        Shop All
      </Link>
      <Link
        to="/allproducts?category=deals"
        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        onClick={closeMenu}
      >
        <span className="flex items-center gap-2">
          <FaFire /> Best Deals
        </span>
        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black">
          HOT
        </span>
      </Link>
      <Link
        to="/wishlist"
        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-colors"
        onClick={closeMenu}
      >
        <div className="flex items-center gap-2">
          <FaHeart className="text-rose-500" /> My Wishlist
        </div>
        {wishlist && wishlist.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
      </Link>
      <Link
        to="/cart"
        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        onClick={closeMenu}
      >
        <div className="flex items-center gap-2">
          <FaShoppingCart className="text-indigo-600" /> Shopping Cart
        </div>
        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
          {cartitem.length || 0}
        </span>
      </Link>

      <div className="pt-3 border-t border-slate-200 space-y-2">
        {user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              onClick={closeMenu}
            >
              <FaUser className="text-indigo-600" /> {user.name || "My Account"}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left font-bold"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/login"
              className="text-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              onClick={closeMenu}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-center px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
              onClick={closeMenu}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const mobileDrawer = menuOpen ? createPortal(
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
        onClick={closeMenu}
      />
      <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 p-6 flex flex-col justify-between md:hidden overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                T
              </div>
              <span className="font-black text-slate-900 text-lg tracking-tight font-['Outfit']">TREO</span>
            </Link>
            <button
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
            />
            <FaSearch
              size={14}
              onClick={handleSearchSubmit}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-indigo-600"
            />
          </div>

          <nav>{mobileNavLinks}</nav>
        </div>

        <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
          <p>© 2026 TREO Tech E-Commerce</p>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* ── Main Navigation Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 text-2xl tracking-tight leading-none font-['Outfit']">
              TREO<span className="text-[#4f46e5]">.</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              TECH STORE
            </span>
          </div>
        </Link>

        {/* ── Perfect Height & Width Integrated Search Bar ── */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl relative items-center">
          <div className="w-full h-11 flex items-stretch bg-slate-100 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#4f46e5] focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter products by category"
              className="bg-transparent text-slate-700 text-xs font-semibold px-3.5 h-full border-r border-slate-300 outline-none cursor-pointer hover:bg-slate-200 transition-colors shrink-0"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent px-4 h-full text-xs text-slate-900 placeholder-slate-400 outline-none min-w-0"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-2.5 text-slate-400 hover:text-slate-600 text-xs shrink-0 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Search Button (Full Height & Seamless Rounded Edge) */}
            <button
              onClick={handleSearchSubmit}
              aria-label="Search"
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 h-full flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <FaSearch size={14} />
            </button>
          </div>

          {/* Live Search Suggestions Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 pb-1.5 px-2">
                Found {searchResults.length} Products
              </p>
              {searchResults.slice(0, 6).map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(`/product/${product._id}`);
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <img
                    src={
                      Array.isArray(product.productimage)
                        ? product.productimage[0]
                        : product.productimage || "https://via.placeholder.com/50"
                    }
                    alt={product.title}
                    className="w-10 h-10 object-contain bg-slate-100 rounded-lg p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{product.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-[#4f46e5]">
                        ₹{Number(product.price).toLocaleString()}
                      </span>
                      {product.category && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Nav Action Items */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="hidden sm:flex items-center justify-center p-2 text-slate-600 hover:text-rose-500 transition-colors relative group"
            title="Wishlist"
          >
            <FaHeart size={18} className="group-hover:scale-110 transition-transform" />
            {wishlist && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Shopping Cart Button */}
          <Link
            to="/cart"
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
            title="View Cart"
          >
            <div className="relative p-2 rounded-xl bg-indigo-50 text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-white transition-colors">
              <FaShoppingCart size={16} />
              {cartitem.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {cartitem.length}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase">My Cart</span>
              <span className="text-xs font-black text-slate-900">
                ₹{totalCartPrice.toLocaleString()}
              </span>
            </div>
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline text-xs font-bold text-slate-800">
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-block px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#4f46e5] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-md transition-all cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* ── Secondary Category Sub-Nav Bar (Figma Sub-Header) ── */}
      <div className="hidden lg:block bg-[#f8fafc] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* All Categories Dropdown Button */}
            <div ref={categoryMenuRef} className="relative">
              <button
                onClick={() => setShowCategoryMenu((s) => !s)}
                className="flex items-center gap-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer"
              >
                <FaBars size={13} />
                <span>All Categories</span>
                <FaChevronDown size={10} className={`transition-transform ${showCategoryMenu ? "rotate-180" : ""}`} />
              </button>

              {showCategoryMenu && (
                <div className="absolute top-full left-0 w-60 bg-white border border-slate-200 rounded-b-2xl shadow-xl py-2 z-50">
                  {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-[#4f46e5] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat.label}</span>
                      <span className="text-slate-400 text-[10px]">›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Link to="/" className="hover:text-[#4f46e5] transition-colors">
                Home
              </Link>
              <Link to="/allproducts" className="hover:text-[#4f46e5] transition-colors">
                Shop
              </Link>
              <Link to="/allproducts?category=deals" className="hover:text-[#4f46e5] transition-colors">
                Deals
              </Link>
              <Link to="/allproducts?category=audio" className="hover:text-[#4f46e5] transition-colors">
                Best Sellers
              </Link>
              <Link to="/allproducts?category=laptop" className="hover:text-[#4f46e5] transition-colors">
                Laptops
              </Link>
              <Link to="/allproducts?category=mobile" className="hover:text-[#4f46e5] transition-colors">
                Smartphones
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawer}
    </header>
  );
}

export default Navbar;

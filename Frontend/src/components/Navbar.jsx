import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import {
  FaShoppingCart,
  FaSignOutAlt,
  FaHome,
  FaChalkboardTeacher,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Navbar() {
  const { user, setUser, setToken, cartitem } = useUser();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const searchRef = useRef(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Debounced search
  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/search/search?q=${searchTerm}`
        );
        setSearchResults(res.data.products || []);
        setShowDropdown(true);
      } catch {
        // silent
      }
    };
    const t = setTimeout(fetchSearch, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim()) {
      setShowDropdown(false);
      setMenuOpen(false);
      navigate(`/search?q=${searchTerm}`);
    }
  }, [searchTerm, navigate]);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === "Enter") handleSearchSubmit(); },
    [handleSearchSubmit]
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken("");
    setMenuOpen(false);
    navigate("/login");
  }, [setUser, setToken, navigate]);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = user ? (
    <>
      <Link
        to="/home"
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
        onClick={closeMenu}
      >
        <FaHome className="text-indigo-600 text-sm" /> Home
      </Link>
      <Link
        to="/allproducts"
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
        onClick={closeMenu}
      >
        <FaChalkboardTeacher className="text-indigo-600 text-sm" /> All Products
      </Link>
      <Link
        to="/cart"
        className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
        onClick={closeMenu}
      >
        <FaShoppingCart className="text-indigo-600 text-sm" /> Cart
        {cartitem.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-sm">
            {cartitem.length}
          </span>
        )}
      </Link>
      <Link
        to="/profile"
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
        onClick={closeMenu}
      >
        <FaUser className="text-indigo-600 text-sm" /> Profile
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
      >
        <FaSignOutAlt className="text-sm" /> Logout
      </button>
    </>
  ) : (
    <>
      <Link
        to="/login"
        className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        onClick={closeMenu}
      >
        Login
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm hover:shadow-md transition-all"
        onClick={closeMenu}
      >
        Register
      </Link>
    </>
  );

  // Mobile drawer — rendered via Portal
  const mobileDrawer = menuOpen ? createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
        onClick={closeMenu}
      />

      {/* Side drawer */}
      <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 p-6 flex flex-col justify-between md:hidden overflow-y-auto">
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link to="/home" className="flex items-center gap-2.5" onClick={closeMenu}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                ⚡
              </div>
              <span className="font-extrabold text-slate-900 text-lg">E-System</span>
            </Link>
            <button
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <FaSearch
                size={14}
                onClick={handleSearchSubmit}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              />
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchTerm(product.title);
                      navigate(`/product/${product._id}`);
                      closeMenu();
                    }}
                  >
                    {product.productimage ? (
                      <img
                        src={Array.isArray(product.productimage) ? product.productimage[0] : product.productimage}
                        alt={product.title}
                        className="w-8 h-8 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs">📦</div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{product.title}</p>
                      <p className="text-xs font-extrabold text-indigo-600">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col space-y-1.5">{navLinks}</nav>
        </div>

        {/* Footer info in drawer */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">© 2026 E-System Inc.</p>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        {/* Brand */}
        <Link to="/home" className="flex items-center gap-2.5 group cursor-pointer flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
            E-System
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-lg mx-6 hidden md:block relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, categories, deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if (searchTerm) setShowDropdown(true); }}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 border border-slate-200 rounded-2xl py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
            <FaSearch
              size={14}
              onClick={handleSearchSubmit}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
            />
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[100] max-h-96 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    setShowDropdown(false);
                    setSearchTerm(product.title);
                    navigate(`/product/${product._id}`);
                  }}
                  className="flex items-center gap-3.5 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {product.productimage ? (
                    <img
                      src={Array.isArray(product.productimage) ? product.productimage[0] : product.productimage}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded-xl border border-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">📦</div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{product.title}</p>
                    <p className="text-xs text-indigo-600 font-extrabold">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">{navLinks}</nav>

        {/* Mobile: cart badge + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {user && cartitem.length > 0 && (
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-indigo-600 rounded-xl"
              onClick={closeMenu}
            >
              <FaShoppingCart size={18} />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-600 text-white">
                {cartitem.length}
              </span>
            </Link>
          )}
          <button
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </header>

      {/* Portal Mobile Drawer */}
      {mobileDrawer}
    </>
  );
}

export default Navbar;

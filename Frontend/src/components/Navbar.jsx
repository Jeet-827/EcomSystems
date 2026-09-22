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

const SEARCH_CATEGORIES = [
  { id: "all", label: "All Categories", icon: "🌐" },
  { id: "mobile", label: "Mobile", icon: "📱" },
  { id: "watch", label: "Watch", icon: "⌚" },
  { id: "shoes", label: "Shoes", icon: "👟" },
  { id: "makeup", label: "Makeup", icon: "💄" },
  { id: "fashion", label: "Fashion", icon: "👗" },
  { id: "beauty", label: "Beauty", icon: "💇‍♀️" },
];

function Navbar() {
  const { user, setUser, setToken, cartitem, logout } = useUser();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  // Debounced search (combines term & category)
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
    setShowDropdown(true);
    if (catId !== "all" && !searchTerm) {
      setSearchTerm(catId);
    }
  };

  const handleKeyDown = useCallback(
    (e) => { if (e.key === "Enter") handleSearchSubmit(); },
    [handleSearchSubmit]
  );

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavClick = useCallback((sectionId) => {
    setMenuOpen(false);
    if (window.location.pathname === "/" || window.location.pathname === "/home") {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(`/#${sectionId}`);
    setTimeout(() => {
      const elem = document.getElementById(sectionId);
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, [navigate]);

  const mobileNavLinks = (
    <div className="flex flex-col space-y-2 text-xs font-bold uppercase tracking-widest text-zinc-300">
      <Link
        to="/"
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors"
        onClick={closeMenu}
      >
        <FaHome className="text-[#10b981]" /> HOME
      </Link>
      <button
        onClick={() => handleNavClick("featured")}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors text-left cursor-pointer"
      >
        FEATURED
      </button>
      <button
        onClick={() => handleNavClick("deals")}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors text-left cursor-pointer"
      >
        BANNERS & DEALS
      </button>
      <button
        onClick={() => handleNavClick("categories")}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors text-left cursor-pointer"
      >
        CATEGORIES
      </button>
      <button
        onClick={() => handleNavClick("why-us")}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors text-left cursor-pointer"
      >
        WHY US
      </button>
      <Link
        to="/allproducts"
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors"
        onClick={closeMenu}
      >
        <FaChalkboardTeacher className="text-[#10b981]" /> COLLECTION
      </Link>
      <Link
        to="/cart"
        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors"
        onClick={closeMenu}
      >
        <div className="flex items-center gap-2">
          <FaShoppingCart className="text-[#10b981]" /> BAG
        </div>
        <span className="w-5 h-5 rounded-full bg-[#10b981] text-black text-[10px] font-black flex items-center justify-center">
          {cartitem.length || 0}
        </span>
      </Link>

      <div className="pt-3 border-t border-white/10 space-y-2">
        {user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:text-[#10b981] hover:bg-white/5 transition-colors"
              onClick={closeMenu}
            >
              <FaUser className="text-[#10b981]" /> {user.name ? user.name.toUpperCase() : "MY PROFILE"}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
            >
              <FaSignOutAlt /> LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="block w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors"
              onClick={closeMenu}
            >
              SIGN IN
            </Link>
            <Link
              to="/register"
              className="block w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-md transition-all"
              onClick={closeMenu}
            >
              GET STARTED
            </Link>
          </>
        )}
      </div>
    </div>
  );

  // Mobile drawer — rendered via Portal
  const mobileDrawer = menuOpen ? createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
        onClick={closeMenu}
      />

      {/* Side drawer */}
      <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-[#181818] border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between md:hidden overflow-y-auto">
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2.5" onClick={closeMenu}>
              <div className="w-8 h-8 rounded-xl bg-[#10b981] text-black flex items-center justify-center font-black text-sm shadow-sm font-['Outfit']">
                A
              </div>
              <span className="font-extrabold text-white text-lg tracking-widest font-['Outfit'] uppercase">AURA</span>
            </Link>
            <button
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Mobile Search with Category Filter */}
          <div className="relative space-y-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products & categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#121212] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#10b981]"
              />
              <FaSearch
                size={14}
                onClick={handleSearchSubmit}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer hover:text-[#10b981]"
              />
            </div>

            {/* Mobile Category Chips */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
              {SEARCH_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 flex-shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#10b981] text-black shadow-sm"
                        : "bg-[#121212] text-zinc-300 border border-white/10 hover:border-[#10b981]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="mt-2 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-white/5">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-2.5 hover:bg-white/5 cursor-pointer transition-colors"
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
                        className="w-8 h-8 object-contain bg-[#121212] rounded-lg p-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#121212] rounded-lg flex items-center justify-center text-xs">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white line-clamp-1">{product.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#10b981]">₹{Number(product.price).toLocaleString()}</span>
                        {product.category && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">
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

          {/* Nav Links */}
          <nav>{mobileNavLinks}</nav>
        </div>

        {/* Footer info in drawer */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">© 2026 AURA x Bang & Olufsen</p>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xl transition-all duration-300">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
          <span className="font-black text-white text-xl sm:text-2xl tracking-widest leading-none font-['Outfit'] uppercase">
            AURA
          </span>
        </Link>

        {/* Middle Navigation Links (from reference image: Featured, Banners & Deals, Categories, Why Us) */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-300">
          <button onClick={() => handleNavClick("featured")} className="hover:text-[#10b981] transition-colors cursor-pointer uppercase">
            FEATURED
          </button>
          <button onClick={() => handleNavClick("deals")} className="hover:text-[#10b981] transition-colors cursor-pointer uppercase">
            BANNERS & DEALS
          </button>
          <button onClick={() => handleNavClick("categories")} className="hover:text-[#10b981] transition-colors cursor-pointer uppercase">
            CATEGORIES
          </button>
          <button onClick={() => handleNavClick("why-us")} className="hover:text-[#10b981] transition-colors cursor-pointer uppercase">
            WHY US
          </button>
        </nav>

        {/* Right Navigation Actions (matching COLLECTION, SIGN IN, GET STARTED) */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            to="/allproducts"
            className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-[#10b981] transition-colors"
          >
            COLLECTION
          </Link>

          {/* Search Icon & Dropdown with Category Filter */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setShowDropdown((s) => !s)}
              className="p-1.5 text-zinc-300 hover:text-[#10b981] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Search Products by Category"
            >
              <FaSearch size={15} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                {/* Search Input */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search all products & categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#10b981]"
                    autoFocus
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Quick Filter Chips */}
                <div className="mb-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 mb-1.5">
                    Filter by Category
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none">
                    {SEARCH_CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#10b981] text-black shadow-md"
                              : "bg-[#121212] text-zinc-300 border border-white/10 hover:border-[#10b981] hover:text-white"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search Results List */}
                {searchResults.length > 0 ? (
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1 border-t border-white/10 pt-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-1">
                      Results ({searchResults.length})
                    </p>
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(`/product/${product._id}`);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        {product.productimage ? (
                          <img
                            src={
                              Array.isArray(product.productimage)
                                ? product.productimage[0]
                                : product.productimage
                            }
                            alt={product.title}
                            className="w-9 h-9 object-contain bg-[#121212] rounded-lg p-1 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-[#121212] rounded-lg flex items-center justify-center text-xs">
                            📦
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#10b981] transition-colors">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-[#10b981]">
                              ₹{Number(product.price).toLocaleString()}
                            </span>
                            {product.category && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 font-semibold">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (searchTerm || selectedCategory !== "all") ? (
                  <div className="text-center py-4 border-t border-white/10 text-xs text-zinc-400">
                    No products found in category
                  </div>
                ) : null}

                {/* View All Action Button */}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full mt-3 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Search All Results →
                </button>
              </div>
            )}
          </div>

          {/* Shopping Bag Counter */}
          <Link
            to="/cart"
            className="relative p-1.5 text-zinc-300 hover:text-[#10b981] transition-colors flex items-center gap-1 cursor-pointer"
            title="Shopping Bag"
          >
            <FaShoppingCart size={15} />
            {cartitem.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#10b981] text-black text-[10px] font-black flex items-center justify-center shadow-md">
                {cartitem.length}
              </span>
            )}
          </Link>

          {/* User Sign In / Profile */}
          {user ? (
            <Link
              to="/profile"
              className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-[#10b981] transition-colors flex items-center gap-1.5"
              title="Profile"
            >
              <FaUser size={14} />
              <span>{user.name ? user.name.split(" ")[0].toUpperCase() : "PROFILE"}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-[#10b981] transition-colors"
            >
              SIGN IN
            </Link>
          )}

          {/* GET STARTED CTA Emerald Button */}
          {user ? (
            <Link
              to="/allproducts"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-white shadow-lg transition-all cursor-pointer"
            >
              EXPLORE
            </Link>
          ) : (
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-white shadow-lg transition-all cursor-pointer"
            >
              GET STARTED
            </Link>
          )}
        </div>

        {/* Mobile: cart badge + hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            to="/cart"
            className="relative p-1.5 text-white hover:text-[#10b981]"
            onClick={closeMenu}
          >
            <FaShoppingCart size={18} />
            {cartitem.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black bg-[#10b981] text-black flex items-center justify-center">
                {cartitem.length}
              </span>
            )}
          </Link>

          <button
            className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
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

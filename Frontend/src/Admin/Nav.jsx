import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../store/Usercontext';

const Nav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark") || 
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  const location = useLocation();
  const path = location.pathname;

  /* Synchronize theme on html element and localStorage */
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("admin_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("admin_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const navLinks = [
    {
      to: "/dashboard",
      icon: "➕",
      label: "Add Product",
      active: path === "/dashboard",
    },
    {
      to: "/allproduct",
      icon: "📦",
      label: "Manage Products",
      active: path === "/allproduct" || path.startsWith("/editproduct"),
    },
    {
      to: "/order",
      icon: "🚚",
      label: "Orders",
      active: path.startsWith("/order"),
    },
    {
      to: "/customersmanage",
      icon: "👥",
      label: "Customers",
      active: path === "/customersmanage",
    },
    {
      to: "/settings",
      icon: "⚙️",
      label: "Settings",
      active: path === "/settings",
    },
  ];

  return (
    <>
      {/* ── Mobile Top Header Bar (< md) ── */}
      <header className="md:hidden w-full h-14 bg-[var(--admin-header-bg)] backdrop-blur-md border-b border-[var(--admin-card-border)] px-4 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] hover:bg-[var(--admin-bg-secondary)] transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <span className="text-xl font-bold">{mobileOpen ? "✕" : "☰"}</span>
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10b981] text-black flex items-center justify-center font-black text-sm shadow-sm font-['Outfit']">
              A
            </div>
            <span className="font-extrabold text-[var(--admin-text-main)] text-base tracking-widest font-['Outfit'] uppercase">
              AURA
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button Mobile */}
          <button
            onClick={toggleTheme}
            className="admin-theme-toggle"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <span className="text-amber-400 text-base">☀️</span>
            ) : (
              <span className="text-emerald-500 text-base">🌙</span>
            )}
          </button>

          <Link
            to="/"
            className="px-2.5 py-1.5 rounded-lg bg-[var(--admin-bg-secondary)] border border-[var(--admin-card-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] text-[11px] font-bold uppercase transition-all"
          >
            Store ↗
          </Link>
        </div>
      </header>

      {/* ── Mobile Backdrop Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar Navigation (Desktop Sticky + Mobile Drawer) ── */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[var(--admin-sidebar-bg)] border-r border-[var(--admin-card-border)] p-4 z-50 md:z-30 flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-200 ease-in-out shadow-sm ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header & Theme Toggle */}
          <div className="flex items-center justify-between pt-1 pb-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#10b981] text-black flex items-center justify-center font-black text-base shadow-sm font-['Outfit'] group-hover:scale-105 transition-transform">
                A
              </div>
              <span className="font-extrabold text-[var(--admin-text-main)] text-lg tracking-widest font-['Outfit'] uppercase">
                AURA
              </span>
            </Link>

            {/* Sun / Moon Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="admin-theme-toggle"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <span className="text-amber-400 text-base hover:scale-110 transition-transform">☀️</span>
              ) : (
                <span className="text-emerald-500 text-base hover:scale-110 transition-transform">🌙</span>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-200 ${
                    link.active
                      ? "bg-[#10b981] text-black font-black shadow-lg shadow-emerald-500/20"
                      : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] hover:bg-[var(--admin-bg-secondary)] font-bold"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Logout Link */}
            <Link
              to="/logout"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors mt-2"
            >
              <span className="text-base">🚪</span>
              <span>Logout</span>
            </Link>
          </nav>
        </div>

        {/* ── Sidebar Footer: Admin Portal Profile Card ── */}
        <div className="pt-4 border-t border-[var(--admin-card-border-subtle)]">
          <div className="flex items-center justify-between p-2.5 bg-[var(--admin-bg-secondary)] border border-[var(--admin-card-border)] rounded-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#10b981] text-black font-black text-xs flex items-center justify-center shadow-sm shrink-0 font-['Outfit']">
                A
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-[var(--admin-text-main)] truncate font-['Outfit']">
                  AURA Admin
                </p>
                <p className="text-[10px] text-[var(--admin-text-muted)] font-medium truncate">
                  Master Portal
                </p>
              </div>
            </div>
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 shrink-0 animate-pulse ml-2"
              title="Online & Protected"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Nav;
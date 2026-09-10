import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Nav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const location = useLocation();
  const path = location.pathname;

  /* Synchronize theme on html element and localStorage */
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
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
      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--admin-sidebar-bg)] border-b border-[var(--admin-card-border)] sticky top-0 z-30 w-full shadow-sm transition-colors">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            ⚡
          </div>
          <span className="font-extrabold text-[var(--admin-text-main)] text-base tracking-tight">
            E-System Admin
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button Mobile */}
          <button
            onClick={toggleTheme}
            className="admin-theme-toggle"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-secondary)] hover:text-[var(--admin-text-main)] transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            <span className="text-xl font-bold">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 admin-sidebar p-6 z-50 flex flex-col justify-between flex-shrink-0 overflow-y-auto transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                ⚡
              </div>
              <span className="font-extrabold text-[var(--admin-text-main)] text-lg tracking-tight">
                E-System
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              {/* Desktop Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="admin-theme-toggle hidden md:inline-flex"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)] hover:bg-[var(--admin-bg-secondary)] transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`admin-sidebar-link ${link.active ? "active" : ""}`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            <Link
              to="/logout"
              onClick={() => setMobileOpen(false)}
              className={`admin-sidebar-link danger-link ${path === "/logout" ? "active" : ""
                }`}
            >
              <span className="text-base">🚪</span>
              <span>Logout</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[var(--admin-card-border)]">
          <div className="flex items-center gap-3 p-3 bg-[var(--admin-bg-secondary)] border border-[var(--admin-card-border-subtle)] rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              A
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-xs text-[var(--admin-text-main)] truncate">
                Admin Portal
              </p>
              <p className="text-[10px] text-[var(--admin-text-muted)] font-medium">
                Super Admin
              </p>
            </div>
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"
              title="System Online"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Nav;
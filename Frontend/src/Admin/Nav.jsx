import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Nav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30 w-full">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">⚡</div>
          <span className="font-extrabold text-slate-900 text-base">E-System Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`db-sidebar ${mobileOpen ? "db-sidebar-open" : ""}`}>
        <div className="db-logo">
          <div className="db-logo-icon">⚡</div>
          <span className="db-logo-text">E-System</span>
        </div>

        <nav className="db-nav">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={`db-nav-item ${path === "/dashboard" ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="db-nav-icon">➕</span>
            <span>Add Product</span>
          </Link>

          <Link
            to="/allproduct"
            onClick={() => setMobileOpen(false)}
            className={`db-nav-item ${path === "/allproduct" ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="db-nav-icon">📦</span>
            <span>Manage Products</span>
          </Link>

          <Link
            to="/order"
            onClick={() => setMobileOpen(false)}
            className={`db-nav-item ${path.startsWith("/order") ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="db-nav-icon">🚚</span>
            <span>Orders</span>
          </Link>

          <Link
            to="/customersmanage"
            onClick={() => setMobileOpen(false)}
            className={`db-nav-item ${path === "/customersmanage" ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="db-nav-icon">👥</span>
            <span>Customers</span>
          </Link>

          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={`db-nav-item ${path === "/settings" ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="db-nav-icon">⚙️</span>
            <span>Settings</span>
          </Link>

          <Link
            to="/logout"
            onClick={() => setMobileOpen(false)}
            className={`db-nav-item ${path === "/logout" ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="db-nav-icon">🚪</span>
            <span>Logout</span>
          </Link>
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-avatar">A</div>
          <div>
            <p className="db-user-name">Admin</p>
            <p className="db-user-role">Super Admin</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Nav;
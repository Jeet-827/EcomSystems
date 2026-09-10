import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Nav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30 w-full shadow-xs">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            ⚡
          </div>
          <span className="font-extrabold text-slate-900 text-base">E-System Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          <span className="text-xl font-bold">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 p-6 z-50 flex flex-col justify-between flex-shrink-0 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between px-1">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                ⚡
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">E-System</span>
            </Link>
            {/* Mobile close inside sidebar */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                path === "/dashboard"
                  ? "font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">➕</span>
              <span>Add Product</span>
            </Link>

            <Link
              to="/allproduct"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                path === "/allproduct"
                  ? "font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">📦</span>
              <span>Manage Products</span>
            </Link>

            <Link
              to="/order"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                path.startsWith("/order")
                  ? "font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">🚚</span>
              <span>Orders</span>
            </Link>

            <Link
              to="/customersmanage"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                path === "/customersmanage"
                  ? "font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">👥</span>
              <span>Customers</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                path === "/settings"
                  ? "font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">⚙️</span>
              <span>Settings</span>
            </Link>

            <Link
              to="/logout"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                path === "/logout"
                  ? "font-bold bg-rose-600 text-white shadow-sm"
                  : "font-semibold text-rose-600 hover:bg-rose-50"
              }`}
            >
              <span className="text-base">🚪</span>
              <span>Logout</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            A
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-slate-900 truncate">Admin Portal</p>
            <p className="text-[10px] text-slate-500 font-medium">Super Admin</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Nav;
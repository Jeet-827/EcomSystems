import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Nav = ({ sidebarOpen = false }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className={`db-sidebar ${sidebarOpen ? "db-sidebar-open" : ""}`}>
      <div className="db-logo">
        <div className="db-logo-icon">⚡</div>
        <span className="db-logo-text">E-System</span>
      </div>

      <nav className="db-nav">
        <Link
          to="/dashboard"
          className={`db-nav-item ${path === "/dashboard" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="db-nav-icon">➕</span>
          <span>Add Product</span>
        </Link>

        <Link
          to="/allproduct"
          className={`db-nav-item ${path === "/allproduct" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="db-nav-icon">📦</span>
          <span>Manage Products</span>
        </Link>

        <Link
          to="/order"
          className={`db-nav-item ${path.startsWith("/order") ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="db-nav-icon">🚚</span>
          <span>Orders</span>
        </Link>

        <Link
          to="/customersmanage"
          className={`db-nav-item ${path === "/customersmanage" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="db-nav-icon">👥</span>
          <span>Customers</span>
        </Link>

        <Link
          to="/settings"
          className={`db-nav-item ${path === "/settings" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="db-nav-icon">⚙️</span>
          <span>Settings</span>
        </Link>

        <Link
          to="/logout"
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
  );
};

export default Nav;
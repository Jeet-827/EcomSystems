import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ADMIN_API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";

const Logout = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const res = await axios.post(
          `${ADMIN_API_BASE_URL}/api/v1/admin/protected`,
          {},
          { withCredentials: true }
        );
        if (res.status === 200 && res.data.success === true && res.data.email) {
          setAdminEmail(res.data.email);
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };
    fetchAdminDetails();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post(
        `${ADMIN_API_BASE_URL}/api/v1/admin/adminlogout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      setLoggingOut(false);
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="admin-layout font-sans">
      <Nav />

      <main className="admin-main flex items-center justify-center min-h-[85vh]">
        <div className="admin-card p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-xl border border-[var(--admin-card-border)]">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mx-auto shadow-sm">
            🚪
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-[var(--admin-text-main)] tracking-tight">
              Log Out Admin
            </h2>
            <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">
              Are you sure you want to terminate your administrative session
              {adminEmail ? (
                <span className="font-semibold text-[var(--admin-text-main)]"> ({adminEmail})</span>
              ) : (
                ""
              )}
              ?
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="admin-btn-secondary text-xs sm:text-sm py-2.5 px-5"
            >
              Cancel
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="admin-btn-danger text-xs sm:text-sm py-2.5 px-6 shadow-md"
            >
              {loggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging out...</span>
                </div>
              ) : (
                <span>Yes, Log Out</span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Logout;

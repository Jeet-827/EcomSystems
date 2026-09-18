import { useState, useEffect } from "react";
import axios from "axios";
import { ADMIN_API_BASE_URL } from "../config/api.config.js";
import { Navigate, Outlet } from "react-router-dom";

const Protectadmin = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      try {
        setLoading(true);
        // Pure cookie-based authentication verification (GET / POST with withCredentials)
        let res;
        try {
          res = await axios.get(`${ADMIN_API_BASE_URL}/api/v1/admin/protected`, {
            withCredentials: true,
            timeout: 5000,
          });
        } catch {
          res = await axios.post(
            `${ADMIN_API_BASE_URL}/api/v1/admin/protected`,
            {},
            { withCredentials: true, timeout: 5000 }
          );
        }

        if (isMounted) {
          if (res.status === 200 && res.data.success === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.log("Admin session check:", error?.response?.data?.message || error.message);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying Admin Credentials...</span>
        </div>
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default Protectadmin;

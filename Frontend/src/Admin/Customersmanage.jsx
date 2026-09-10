import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ADMIN_API_BASE_URL, API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";

const Customersmanage = () => {
  const [alluserfound, setAlluserfound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getalluser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      try {
        res = await axios.get(`${ADMIN_API_BASE_URL}/api/v1/user/alluser`, {
          withCredentials: true,
        });
      } catch {
        res = await axios.get(`${API_BASE_URL}/api/v1/alluser`, {
          withCredentials: true,
        });
      }

      const usersList = res.data.AllUser || res.data.users || res.data.allUser || res.data.data || [];
      setAlluserfound(usersList);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to fetch customer list from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getalluser();
  }, [getalluser]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row font-sans">
      <Nav />

      <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Customer Management
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                View all registered accounts from MongoDB database
              </p>
            </div>
            <div>
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                Total Users: {alluserfound.length}
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 text-sm font-semibold">Loading user accounts...</p>
            </div>
          ) : alluserfound.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-slate-500 text-sm">No customers found in database.</p>
            </div>
          ) : (
            /* User Table Card */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-6">#</th>
                      <th className="py-3.5 px-6">Name</th>
                      <th className="py-3.5 px-6">Email</th>
                      <th className="py-3.5 px-6">User ID</th>
                      <th className="py-3.5 px-6">Cart Items</th>
                      <th className="py-3.5 px-6">Orders</th>
                      <th className="py-3.5 px-6">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {alluserfound.map((u, idx) => (
                      <tr
                        key={u._id || idx}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {u.name || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                          {u.email}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                          {u._id?.slice(-8) || "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700">
                            {u.cartitem?.length || 0} items
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            {u.orderId?.length || 0} orders
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customersmanage;

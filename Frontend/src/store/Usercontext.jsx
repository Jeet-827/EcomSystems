import { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";

const Usercontext = createContext();

export const Providerfun = ({ children }) => {
  // Initialize user state from localStorage so reload never logs out
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Initialize token state from localStorage
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token") || "";
    } catch {
      return "";
    }
  });

  const [loading, setLoading] = useState(false);
  const [cartitem, setCartitem] = useState([]);
  const [editproduct, setEditproduct] = useState([]);

  // Sync user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Sync token state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Silent verification with backend on mount
  const verifySession = async () => {
    try {
      const savedToken = localStorage.getItem("token");
      const headers = savedToken ? { Authorization: `Bearer ${savedToken}` } : {};
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/tokenData/regen`,
        { token: savedToken },
        { headers, withCredentials: true, timeout: 5000 }
      );
      if (res.data?.user) {
        setUser(res.data.user);
      }
      if (res.data?.token) {
        setToken(res.data.token);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifySession();
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      loading,
      cartitem,
      setCartitem,
      token,
      setToken,
      editproduct,
      setEditproduct,
    }),
    [user, loading, cartitem, token, editproduct]
  );

  return (
    <Usercontext.Provider value={contextValue}>
      {children}
    </Usercontext.Provider>
  );
};

export const useUser = () => useContext(Usercontext);

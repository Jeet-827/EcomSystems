import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
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

  // Initialize wishlist state from localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("treo_wishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
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

  // Sync wishlist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("treo_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage:", e);
    }
  }, [wishlist]);

  // Wishlist helper methods
  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlist.some((item) => (item._id || item.id) === productId);
    },
    [wishlist]
  );

  const addToWishlist = useCallback((product) => {
    if (!product) return;
    const pId = product._id || product.id;
    setWishlist((prev) => {
      if (prev.some((item) => (item._id || item.id) === pId)) return prev;
      return [product, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    if (!productId) return;
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    if (!product) return false;
    const pId = product._id || product.id;
    let added = false;
    setWishlist((prev) => {
      const exists = prev.some((item) => (item._id || item.id) === pId);
      if (exists) {
        added = false;
        return prev.filter((item) => (item._id || item.id) !== pId);
      } else {
        added = true;
        return [product, ...prev];
      }
    });
    return added;
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

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

  // Centralized logout that sends request to backend and clears all client state & cookies
  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout request error:", error?.message || error);
    } finally {
      setUser(null);
      setToken("");
      setCartitem([]);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

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
      wishlist,
      setWishlist,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      wishlistCount: wishlist.length,
      logout,
    }),
    [
      user,
      loading,
      cartitem,
      token,
      editproduct,
      wishlist,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
    ]
  );

  return (
    <Usercontext.Provider value={contextValue}>
      {children}
    </Usercontext.Provider>
  );
};

export const useUser = () => useContext(Usercontext);

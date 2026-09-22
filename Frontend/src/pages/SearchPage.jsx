import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";
import { useUser } from "../store/Usercontext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { FaShoppingCart, FaHeart, FaStar, FaSearch, FaArrowLeft } from "react-icons/fa";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();
  const { token, setCartitem } = useUser();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSearchResults = useCallback(async () => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/search/search?q=${encodeURIComponent(query)}`
      );
      setProducts(res.data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!token) {
        toast.info("Please sign in to add items to cart!");
        setTimeout(() => navigate("/login"), 800);
        return;
      }
      try {
        const payload = {
          itemimage: product.productimage,
          productid: product._id,
          producttitle: product.title,
          productprice: product.price,
          productdescription: product.description,
        };
        await axios.post(`${API_BASE_URL}/api/v1/cartdata/cartitem`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Added to Bag! 🛍️", { autoClose: 900 });
        const cartRes = await axios.get(`${API_BASE_URL}/api/v1/cartdata/cartget`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartitem(cartRes.data.cart || []);
      } catch {
        toast.error("Failed to add to bag.");
      }
    },
    [token, navigate, setCartitem]
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Search Results
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              Results for: <span className="text-[#4f46e5]">"{query}"</span>
            </h1>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#4f46e5] bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <FaArrowLeft size={11} /> Go Back
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="spinner-purple" />
            <p className="text-slate-400 text-xs font-bold uppercase">Searching database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3 shadow-sm max-w-lg mx-auto">
            <div className="text-5xl">🔍</div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No products found for "{query}"</h3>
            <p className="text-xs text-slate-500">Check for spelling mistakes or explore our catalog.</p>
            <button
              onClick={() => navigate("/allproducts")}
              className="px-6 py-2.5 btn-purple-primary text-xs font-bold uppercase mt-2"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => {
              const imgSrc = Array.isArray(p.productimage)
                ? p.productimage[0]
                : p.productimage || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="group card-tech flex flex-col justify-between cursor-pointer h-full bg-white border border-slate-200 hover:border-indigo-300 transition-all duration-300 p-4"
                >
                  <div className="relative w-full h-44 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3">
                    <img
                      src={imgSrc}
                      alt={p.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      {p.category && (
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {p.category}
                        </span>
                      )}
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#4f46e5] transition-colors font-['Outfit']">
                        {p.title}
                      </h2>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                      <span className="text-base font-black text-slate-900 font-['Outfit']">
                        ₹{Number(p.price).toLocaleString()}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        className="px-3 py-1.5 btn-purple-primary text-xs font-bold gap-1"
                      >
                        <FaShoppingCart size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SearchPage;

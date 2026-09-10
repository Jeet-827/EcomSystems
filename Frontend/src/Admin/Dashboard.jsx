import { useState } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";
import { toast } from "react-toastify";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useUser();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a product image!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("file", file);

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/productgenereted/createproduct`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("Product Created:", res.data);
      toast.success(res.data.message || "Product created successfully!");

      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setFile(null);
      setPreview(null);
      const input = document.getElementById("fileInput");
      if (input) input.value = "";
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to create product.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <Nav />

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Fill in the details below to add a new product to the store catalog.
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Image Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Product Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label
                    htmlFor="fileInput"
                    className="block w-full h-48 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl cursor-pointer transition-all relative overflow-hidden group"
                  >
                    {preview ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-900/5">
                        <img
                          src={preview}
                          alt="Product Preview"
                          className="w-full h-full object-contain p-2 rounded-xl"
                        />
                        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg backdrop-blur-sm flex items-center gap-1.5 shadow-md transition-all">
                          <span>🔄</span>
                          <span>Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                        <div className="text-3xl text-indigo-500 group-hover:scale-110 transition-transform">
                          📷
                        </div>
                        <div className="text-sm font-bold text-slate-700">
                          Click to upload product image
                        </div>
                        <div className="text-xs text-slate-400">
                          PNG, JPG, WEBP up to 10MB
                        </div>
                      </div>
                    )}
                  </label>

                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                      <span className="truncate max-w-[80%]">
                        Selected: <strong className="text-slate-800">{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                          setPreview(null);
                          const input = document.getElementById("fileInput");
                          if (input) input.value = "";
                        }}
                        className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 cursor-pointer"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Beauty & Personal Care">
                    Beauty & Personal Care
                  </option>
                  <option value="Sports & Fitness">Sports & Fitness</option>
                  <option value="Books">Books</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describe key features, specs, and highlights of the product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Product...</span>
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      <span>Create Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

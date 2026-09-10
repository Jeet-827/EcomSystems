import { useState } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const POPULAR_CATEGORIES = [
  "Fashion",
  "Footwear",
  "Electronics",
  "Accessories",
  "Home & Living",
  "Beauty",
];

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
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a product image!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("price", price);
      formData.append("category", category.trim());
      formData.append("description", description.trim());
      formData.append("file", file);

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/productgenereted/createproduct`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || "Product published successfully!");

      // Reset form
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      handleRemoveFile();
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to create product. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Nav />

      <main className="admin-main">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--admin-card-border)]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">➕</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight">
                  Add New Product
                </h1>
              </div>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                Upload image assets and configure catalog metadata for the storefront.
              </p>
            </div>

            <Link
              to="/allproduct"
              className="admin-btn-secondary text-xs sm:text-sm py-2 px-4 self-start sm:self-auto"
            >
              <span>📦</span> View All Products
            </Link>
          </div>

          {/* Form Card */}
          <div className="admin-card p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Product Image Dropzone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
                  Product Image <span className="text-rose-500">*</span>
                </label>

                {preview ? (
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-[var(--admin-card-border)] bg-[var(--admin-bg-secondary)] flex items-center justify-center group">
                    <img
                      src={preview}
                      alt="Selected preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label
                        htmlFor="fileInput"
                        className="admin-btn-secondary text-xs py-2 px-3.5 cursor-pointer"
                      >
                        Change Image
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="admin-btn-danger text-xs py-2 px-3.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-2xl cursor-pointer transition-all relative group text-center p-6"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                      📸
                    </div>
                    <p className="text-sm font-bold text-[var(--admin-text-main)]">
                      Click to upload or drag & drop product image
                    </p>
                    <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                      PNG, JPG, WEBP up to 10MB (Uploaded to ImageKit CDN)
                    </p>
                  </label>
                )}

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Classic Vintage Denim Jacket"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="admin-input font-medium"
                  required
                />
              </div>

              {/* Price & Category Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
                    Price in INR (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--admin-text-muted)] font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="admin-input pl-8 font-black"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fashion, Electronics"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="admin-input font-medium"
                    required
                  />
                  {/* Category Suggestion Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:border-[var(--admin-accent)] border border-[var(--admin-card-border)] transition-colors cursor-pointer"
                      >
                        +{cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2">
                  Product Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide detailed material information, sizing, fit, and key product features..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="admin-input"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[var(--admin-card-border-subtle)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setPrice("");
                    setCategory("");
                    setDescription("");
                    handleRemoveFile();
                  }}
                  className="admin-btn-secondary text-xs sm:text-sm py-2.5 px-4"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn-primary text-xs sm:text-sm py-2.5 px-6 shadow-md"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading & Saving...</span>
                    </div>
                  ) : (
                    <span>🚀 Publish Product</span>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL, ADMIN_API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productimage, setProductimage] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        let product = null;

        // Try Admin API
        try {
          const res = await axios.get(`${ADMIN_API_BASE_URL}/api/v1/edit/editallproduct`);
          if (res.data?.data && Array.isArray(res.data.data)) {
            product = res.data.data.find((p) => p._id === id);
          }
        } catch {
          // Fallback to main backend
        }

        // Fallback to main backend products if not found
        if (!product) {
          const res = await axios.get(`${API_BASE_URL}/api/v1/product/productget?limit=0`);
          const list = res.data?.products || res.data?.data || [];
          product = list.find((p) => p._id === id);
        }

        if (product) {
          setProductimage(product.productimage?.[0] || product.image || "");
          setTitle(product.title || "");
          setPrice(product.price || "");
          setCategory(product.category || "");
          setDescription(product.description || "");
        } else {
          toast.error("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const updateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${ADMIN_API_BASE_URL}/api/v1/edit/updateproduct/${id}`,
        {
          productimage: [productimage],
          title,
          price: Number(price),
          category,
          description,
        },
        { withCredentials: true }
      );
      toast.success("Product updated successfully!");
      setTimeout(() => {
        navigate("/allproduct");
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      try {
        await axios.delete(`${ADMIN_API_BASE_URL}/api/v1/edit/deleteproduct/${id}`, {
          withCredentials: true,
        });
      } catch {
        await axios.delete(`${API_BASE_URL}/api/v1/product/deleteproduct/${id}`, {
          withCredentials: true,
        });
      }
      toast.success("Product deleted successfully!");
      setDeleteModal(false);
      setTimeout(() => {
        navigate("/allproduct");
      }, 400);
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-layout font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Nav />

      <main className="admin-main">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--admin-card-border)]">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--admin-text-muted)]">
              <Link
                to="/allproduct"
                className="hover:text-[var(--admin-accent)] font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>←</span> Manage Products
              </Link>
              <span>/</span>
              <span className="text-[var(--admin-text-main)] font-bold">
                Edit Product
              </span>
            </div>

            <button
              onClick={() => setDeleteModal(true)}
              className="admin-btn-danger text-xs py-1.5 px-3"
            >
              🗑️ Delete Product
            </button>
          </div>

          {loading ? (
            <div className="admin-card p-16 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                Loading product data...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Image Preview Card */}
              <div className="admin-card p-5 space-y-4 h-fit">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
                  Product Image Preview
                </h3>
                
                <div className="aspect-square w-full rounded-xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-card-border)] overflow-hidden flex items-center justify-center relative group">
                  {productimage ? (
                    <img
                      src={productimage}
                      alt={title || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300?text=Invalid+Image+URL";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-[var(--admin-text-muted)]">
                      No image URL provided
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                    Image Source URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={productimage}
                    onChange={(e) => setProductimage(e.target.value)}
                    className="admin-input text-xs"
                  />
                  <p className="text-[11px] text-[var(--admin-text-subtle)] mt-1">
                    Paste an ImageKit or direct image link
                  </p>
                </div>
              </div>

              {/* Product Edit Form */}
              <div className="lg:col-span-2 admin-card p-6 sm:p-7">
                <div className="mb-5 pb-4 border-b border-[var(--admin-card-border-subtle)]">
                  <h2 className="text-xl font-bold text-[var(--admin-text-main)]">
                    Edit Product Details
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                    Product ID: <span className="font-mono text-[var(--admin-accent)]">{id}</span>
                  </p>
                </div>

                <form onSubmit={updateProduct} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                      Product Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vintage Leather Jacket"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="admin-input"
                      required
                    />
                  </div>

                  {/* Price & Category row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                        Price (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1499"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="admin-input font-bold"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apparel, Electronics"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Enter detailed product description, specifications, materials..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--admin-card-border-subtle)]">
                    <Link
                      to="/allproduct"
                      className="admin-btn-secondary text-xs sm:text-sm py-2 px-4"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="admin-btn-primary text-xs sm:text-sm py-2 px-6"
                    >
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[var(--admin-text-main)]">
                Delete Product?
              </h3>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[var(--admin-text-main)]">
                  "{title || "this product"}"
                </span>
                ? This action is permanent.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                className="admin-btn-secondary text-xs sm:text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="admin-btn-danger text-xs sm:text-sm py-2 px-5"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProduct;

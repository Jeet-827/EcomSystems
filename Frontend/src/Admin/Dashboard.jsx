import { useState } from "react";
import axios from "axios";
import { useUser } from "../store/Usercontext";
import { API_BASE_URL } from "../config/api.config.js";
import Nav from "./Nav";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const POPULAR_TAGS = [
  "Fashion",
  "Watch",
  "Luxury",
  "Shoes",
  "Electronics",
  "Audio",
];

function Dashboard() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("25");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useUser();

  const addFiles = (newFiles) => {
    const validImageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    if (validImageFiles.length === 0) return;

    const combined = [...files, ...validImageFiles].slice(0, 4);
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    if (files.length === 0) {
      setActiveIndex(0);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      addFiles(selected);
    }
    e.target.value = "";
  };

  const handleSlotFileChange = (e, slotIndex) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.type.startsWith("image/")) return;

    const newFiles = [...files];
    if (slotIndex < newFiles.length) {
      newFiles[slotIndex] = selectedFile;
    } else {
      newFiles.push(selectedFile);
    }
    const updated = newFiles.slice(0, 4);
    setFiles(updated);
    setPreviews(updated.map((f) => URL.createObjectURL(f)));
    setActiveIndex(Math.min(slotIndex, updated.length - 1));
    e.target.value = "";
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(updatedFiles);
    setPreviews(updatedFiles.map((f) => URL.createObjectURL(f)));
    if (activeIndex >= updatedFiles.length) {
      setActiveIndex(Math.max(0, updatedFiles.length - 1));
    }
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    setPreviews([]);
    setActiveIndex(0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleTagClick = (tag) => {
    setCategory(tag);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please upload at least one product image!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("price", price);
      formData.append("category", category.trim());
      formData.append("description", description.trim());
      formData.append("stock", stock);

      // Append all selected files for upload
      files.forEach((f) => {
        formData.append("files", f);
      });

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/productgenereted/createproduct`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        res.data.message || `Product with ${files.length} image(s) published successfully!`
      );

      // Reset form
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setStock("25");
      handleClearAllFiles();
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
      <Nav />

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Title & Subtitle */}
          <div className="pb-5 border-b border-[var(--admin-card-border)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">➕</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-main)] tracking-tight font-['Outfit']">
                  Add New Product
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] mt-1.5 font-medium">
                Create a new inventory listing with multi-currency pricing and category tags.
              </p>
            </div>
          </div>

          {/* Form with Two-Column Responsive Grid */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* ── Left Column: Product Image Dropzone & Gallery (md:col-span-5) ── */}
              <div className="md:col-span-5 admin-card p-5 sm:p-6 space-y-4 rounded-2xl sm:rounded-3xl shadow-md border border-[var(--admin-card-border)]">
                
                {/* Master Image Preview / Main Dropzone */}
                {previews.length > 0 ? (
                  <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-[var(--admin-card-border)] bg-[var(--admin-bg)] flex items-center justify-center p-3 group">
                    <img
                      src={previews[activeIndex] || previews[0]}
                      alt="Selected product preview"
                      className="max-h-full max-w-full object-contain transition-all duration-300"
                    />

                    {/* Image Counter Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-white/10 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 z-10">
                      <span>🖼️</span>
                      <span>
                        Photo {activeIndex + 1} of {previews.length}
                        {activeIndex === 0 ? " (Main)" : ""}
                      </span>
                    </div>

                    {/* Left/Right Quick Preview Arrows */}
                    {previews.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveIndex((prev) => (prev > 0 ? prev - 1 : previews.length - 1))
                          }
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center font-bold text-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                          title="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveIndex((prev) => (prev < previews.length - 1 ? prev + 1 : 0))
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center font-bold text-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                          title="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}

                    {/* Overlay Actions on Hover */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs z-10">
                      {previews.length < 4 && (
                        <label
                          htmlFor="masterFileInput"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md cursor-pointer transition-colors"
                        >
                          + Add More
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(activeIndex)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                      >
                        Delete Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllFiles}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 border border-white/10 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty State Drag & Drop Area */
                  <label
                    htmlFor="masterFileInput"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl cursor-pointer p-6 flex flex-col items-center justify-center transition-all h-56 sm:h-64 text-center group ${
                      isDragging
                        ? "border-[#10b981] bg-emerald-500/10 scale-[1.01]"
                        : "border-[var(--admin-card-border)] hover:border-[#10b981] bg-[var(--admin-bg-secondary)] hover:bg-[var(--admin-card-hover-bg)]"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-3xl mb-2.5 group-hover:scale-110 transition-transform">
                      📷
                    </div>
                    <p className="text-sm font-bold text-[var(--admin-text-main)] font-['Outfit']">
                      Upload Product Images (Up to 4)
                    </p>
                    <p className="text-xs text-[var(--admin-text-muted)] mt-1.5">
                      Click or drag & drop to select multiple images
                    </p>
                    <span className="mt-3 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      Multi-Photo Enabled
                    </span>
                  </label>
                )}

                {/* Hidden Master File Input for multi-selection */}
                <input
                  id="masterFileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* 4 Dedicated Image Slots */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--admin-text-muted)] px-0.5">
                    <span>IMAGE GALLERY SLOTS ({previews.length}/4)</span>
                    {previews.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllFiles}
                        className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer text-[10px]"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 pt-0.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const hasImage = previews[slotIdx];
                      const isSelected = activeIndex === slotIdx;
                      const slotLabels = ["Cover", "Angle 2", "Angle 3", "Angle 4"];

                      return (
                        <div
                          key={slotIdx}
                          onClick={() => {
                            if (hasImage) {
                              setActiveIndex(slotIdx);
                            }
                          }}
                          className={`aspect-square rounded-xl relative overflow-hidden transition-all duration-200 group/slot ${
                            hasImage
                              ? isSelected
                                ? "ring-2 ring-[#10b981] ring-offset-2 ring-offset-[#121212] cursor-pointer scale-105 z-10 shadow-lg"
                                : "border border-white/20 hover:border-[#10b981] cursor-pointer opacity-80 hover:opacity-100"
                              : "border-2 border-dashed border-[var(--admin-card-border)] bg-[var(--admin-bg-secondary)] hover:border-[#10b981]"
                          }`}
                        >
                          {hasImage ? (
                            <>
                              <img
                                src={hasImage}
                                alt={`Slot ${slotIdx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Slot Number Badge */}
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold">
                                #{slotIdx + 1}
                              </span>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(slotIdx);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold transition-colors"
                                title="Delete image"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Dedicated Slot File Input */}
                              <label
                                htmlFor={`slotInput-${slotIdx}`}
                                className="w-full h-full flex flex-col items-center justify-center text-[var(--admin-text-muted)] hover:text-[#10b981] cursor-pointer transition-colors p-1"
                              >
                                <span className="text-base">🖼️</span>
                                <span className="text-[10px] font-bold mt-0.5">+ Add</span>
                                <span className="text-[8px] text-[var(--admin-text-muted)] font-medium">
                                  {slotLabels[slotIdx]}
                                </span>
                              </label>
                              <input
                                id={`slotInput-${slotIdx}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSlotFileChange(e, slotIdx)}
                                className="hidden"
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* ── Right Column: Product Details Form (md:col-span-7) ── */}
              <div className="md:col-span-7 admin-card p-5 sm:p-6 space-y-4 rounded-2xl sm:rounded-3xl shadow-md border border-[var(--admin-card-border)]">
                <h3 className="text-base font-bold text-[var(--admin-text-main)] font-['Outfit'] pb-2 border-b border-[var(--admin-card-border-subtle)]">
                  Product Details
                </h3>

                {/* Product Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro Max 256GB"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="admin-input text-sm py-2.5 px-3.5"
                    required
                  />
                </div>

                {/* Price & Stock in 2 Columns */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price in INR */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                      Price in INR (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="69,999"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="admin-input pl-8 py-2.5 text-sm font-bold"
                        min="1"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="admin-input py-2.5 text-sm"
                      min="0"
                    />
                  </div>
                </div>

                {/* Category & Tags */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile, Laptop, Shoes"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="admin-input text-sm py-2.5 px-3.5"
                    required
                  />

                  {/* Category Filter Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          category === tag
                            ? "bg-[#10b981] text-black border-[#10b981] font-black shadow-sm"
                            : "bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] border-[var(--admin-card-border)] hover:border-[#10b981] hover:text-[var(--admin-text-main)]"
                        }`}
                      >
                        +{tag}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCategory("")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--admin-bg-secondary)] text-[var(--admin-text-muted)] border border-[var(--admin-card-border)] hover:text-[var(--admin-text-main)] cursor-pointer"
                    >
                      +Clear
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter full product details, specs, and highlights..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="admin-input text-sm p-3 resize-none"
                    required
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full admin-primary-btn py-3 text-sm font-bold tracking-wider uppercase"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publishing Product...</span>
                      </div>
                    ) : (
                      <span>Publish Product</span>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </form>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;

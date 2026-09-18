import Product from "../model/product.model.js";
import imagekit from "../config/imagekit.config.js";
import { clearCachePattern } from "../utils/cache.js";

// Simple in-memory cache (TTL: 60 seconds)
const cache = new Map();
const CACHE_TTL = 60 * 1000;

const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};
const setCache = (key, data) => cache.set(key, { data, ts: Date.now() });
const invalidateCache = () => {
  cache.clear();
  try {
    clearCachePattern("/product");
    clearCachePattern("/categories");
    clearCachePattern("/search");
  } catch {}
};

export const GetAllProduct = async (req, res) => {
  try {
    const isAll = req.query.all === "true" || req.query.limit === "0" || req.query.limit === "all";
    const page = parseInt(req.query.page) || 1;
    const limit = isAll ? 0 : (parseInt(req.query.limit) || 12);
    const category = req.query.category;
    const search = req.query.search;
    const skip = isAll ? 0 : (page - 1) * limit;

    const cacheKey = `products:${category || ""}:${search || ""}:${page}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    let filterQuery = {};
    if (category && category.toLowerCase() !== "all") {
      filterQuery.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    if (search && search.trim() !== "") {
      filterQuery.title = { $regex: search.trim(), $options: "i" };
    }

    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(filterQuery),
      Product.find(filterQuery).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    ]);

    const totalPages = isAll ? 1 : (Math.ceil(totalProducts / (limit || 1)) || 1);
    const result = { message: "Products fetched", products, totalProducts, totalPages, currentPage: page };
    setCache(cacheKey, result);

    res.status(200).json(result);
  } catch (error) {
    console.error("GetAllProduct:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const CreateProduct = async (req, res) => {
  try {
    const { title, price, category, description } = req.body;
    let imageUrls = [];

    const filesToUpload = req.files || (req.file ? [req.file] : []);

    if (filesToUpload.length > 0) {
      for (const item of filesToUpload) {
        try {
          const uploadimage = await imagekit.upload({
            file: item.buffer,
            fileName: item.originalname || "product.jpg",
            folder: "products",
          });
          if (uploadimage?.url) {
            imageUrls.push(uploadimage.url);
          }
        } catch (uploadErr) {
          console.error("ImageKit upload error:", uploadErr.message);
          const base64 = `data:${item.mimetype};base64,${item.buffer.toString("base64")}`;
          imageUrls.push(base64);
        }
      }
    }

    if (imageUrls.length === 0 && req.body.productimage) {
      imageUrls = Array.isArray(req.body.productimage)
        ? req.body.productimage
        : [req.body.productimage];
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({ message: "At least one product image is required" });
    }

    const ProductData = await Product.create({
      productimage: imageUrls,
      title,
      price,
      category,
      description,
    });

    invalidateCache();

    res.status(201).json({ message: "Product Created successfully", ProductData });
  } catch (error) {
    console.error("CreateProduct:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const GetProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const result = { message: "Product fetched successfully", product };
    setCache(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    console.error("GetProductById:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const GetCategories = async (req, res) => {
  try {
    const cacheKey = "categories";
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const rawCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          sampleId: { $first: "$_id" },
          sampleTitle: { $first: "$title" },
          samplePrice: { $first: "$price" },
          sampleDescription: { $first: "$description" },
          sampleImage: { $first: "$productimage" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const result = {
      message: "Categories fetched",
      categories: rawCategories.map((c) => ({
        name: c._id,
        count: c.count,
        image: c.sampleImage,
        product: {
          _id: c.sampleId,
          title: c.sampleTitle,
          price: c.samplePrice,
          category: c._id,
          description: c.sampleDescription,
          productimage: c.sampleImage,
        },
      })),
    };
    setCache(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    console.error("GetCategories:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const DeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    invalidateCache();
    res.status(200).json({ message: "Product deleted successfully", data: product });
  } catch (error) {
    console.error("DeleteProduct:", error.message);
    res.status(500).json({ message: error.message });
  }
};

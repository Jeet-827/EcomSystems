import Product from "../model/product.model.js";
import imagekit from "../config/imagekit.config.js";
import { clearCachePattern } from "../utils/cache.js";

export const GetAllProduct = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 }).lean();
    res.status(200).json({
      message: "All product is show",
      data: products,
    });
  } catch (error) {

    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export const GetAllUpdate = async (req, res) => {
  const { id } = req.params;
  try {
    const { title, price, category, description } = req.body;
    const image = req.file;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let updateData = { title, price, category, description };

    if (image) {
      const uploadimage = await imagekit.upload({
        file: image.buffer,
        fileName: image.originalname,
        folder: "products",
      });
      updateData.productimage = uploadimage.url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: "after" }
    );

    clearCachePattern("/product");
    clearCachePattern("/categories");
    clearCachePattern("/search");

    res.status(200).json({
      message: "Product Updated Successfully",
      data: updatedProduct,
    });
  } catch (error) {

    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export const DeleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    clearCachePattern("/product");
    clearCachePattern("/categories");
    clearCachePattern("/search");

    res.status(200).json({
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {

    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

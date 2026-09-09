import Order from "../models/order.model.js";
import "../models/product.model.js";

export const showorder = async (req, res) => {
  try {
    const Od = await Order.find({}).populate("productid userid").sort({ createdAt: -1 }).lean();
    res.status(200).json({
      message: "All Product Find",
      Od,
      orders: Od,
      data: Od,
    });
  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order Status Updated",
      order,
    });
  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

export const singleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("productid userid");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};



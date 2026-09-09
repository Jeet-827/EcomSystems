import Admin from "../model/admin.model.js";
import jwt from "jsonwebtoken";

export const Protected = async (req, res) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.body?.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing",
        success: false,
      });
    }

    const varify = jwt.verify(token, process.env.ADMINKEY || "admin_secret");
    const admin = await Admin.findById(varify.id).select("-password");
    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Login",
      success: true,
      email: admin.email,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired admin session",
      success: false,
      error: error.message,
    });
  }
};

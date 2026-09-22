import mongoose from "mongoose";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signTokens = (id) => ({
  accessToken: jwt.sign({ id }, process.env.SECRET_ONE, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ id }, process.env.SECRET_TWO, { expiresIn: "7d" }),
});

export const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const { accessToken, refreshToken } = signTokens(user._id);
    res.cookie("token", refreshToken, cookieOptions);

    return res.status(201).json({
      message: "User created",
      user: { _id: user._id, name: user.name, email: user.email },
      AccessToken: accessToken,
    });
  } catch (error) {
    console.error("Signup:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Password does not match" });

    const { accessToken, refreshToken } = signTokens(user._id);
    res.cookie("token", refreshToken, cookieOptions);

    return res.status(200).json({
      message: "Signin successfully",
      user: { _id: user._id, name: user.name, email: user.email },
      AccessToken: accessToken,
    });
  } catch (error) {
    console.error("Signin:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token found" });

    const decoded = jwt.verify(token, process.env.SECRET_TWO);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) return res.status(401).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (error) {

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const Logout = async (req, res) => {
  try {
    const clearOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    // Explicitly clear known auth cookies
    res.clearCookie("token", clearOptions);
    res.clearCookie("adminToken", clearOptions);
    res.clearCookie("token");
    res.clearCookie("adminToken");

    // Clear any additional cookies attached to the request
    if (req.cookies && typeof req.cookies === "object") {
      Object.keys(req.cookies).forEach((cookieName) => {
        res.clearCookie(cookieName, clearOptions);
        res.clearCookie(cookieName);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully and all cookies cleared",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ message: error.message || "Failed to logout" });
  }
};

export const resolveUserId = (req) => {
  if (req.UserId && mongoose.Types.ObjectId.isValid(req.UserId)) return String(req.UserId);
  if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) return String(req.user._id);

  // 1. Extract from Authorization header
  let token = null;
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]?.trim();
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.body?.token) {
    token = req.body.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_ONE);
      if (decoded?.id && mongoose.Types.ObjectId.isValid(decoded.id)) return String(decoded.id);
    } catch {
      try {
        const decoded = jwt.verify(token, process.env.SECRET_TWO);
        if (decoded?.id && mongoose.Types.ObjectId.isValid(decoded.id)) return String(decoded.id);
      } catch {
        // Invalid or expired token
      }
    }
  }

  // 2. Fallback to userId from body
  const candidateId = req.body?.userId || req.body?.id || req.body?._id;
  if (candidateId && mongoose.Types.ObjectId.isValid(candidateId)) {
    return String(candidateId);
  }

  return null;
};

export const changePassword = async (req, res) => {
  try {
    const {
      email,
      oldPassword,
      password,
      currentPassword,
      newPassword,
      newpassword,
      new_password,
    } = req.body;

    const currentPass = oldPassword || password || currentPassword;
    const nextPass = newPassword || newpassword || new_password;

    if (!nextPass) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (typeof nextPass !== "string" || nextPass.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Resolve user by token / body id
    const resolvedId = resolveUserId(req);
    let user = null;

    if (resolvedId) {
      user = await User.findById(resolvedId);
    }

    // Fallback: search by email if provided
    if (!user && email && typeof email === "string") {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found. Please log in again." });
    }

    // If user has an existing password, verify old password
    if (user.password) {
      if (!currentPass) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPass, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect old password" });
      }
    }

    user.password = await bcrypt.hash(nextPass.trim(), 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("changePassword:", error.message);
    return res.status(500).json({ message: error.message || "Failed to change password" });
  }
};

export const editUser = async (req, res) => {
  try {
    const { name, username, email } = req.body;

    const resolvedId = resolveUserId(req);
    let user = null;

    if (resolvedId) {
      user = await User.findById(resolvedId);
    }

    // Fallback: search by email if provided
    if (!user && email && typeof email === "string") {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found. Please log in again." });
    }

    // Update email if provided and changed
    if (email && typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email.toLowerCase()) {
        const emailExists = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        }).lean();

        if (emailExists) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = normalizedEmail;
      }
    }

    // Update name / username if provided
    const newName = name !== undefined ? name : username;
    if (newName !== undefined && typeof newName === "string" && newName.trim()) {
      user.name = newName.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("editUser:", error.message);
    return res.status(500).json({ message: error.message || "Failed to update profile" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const AllUser = await User.find({}).select("-password").lean();
    return res.status(200).json({ message: "Users fetched successfully", AllUser });
  } catch (error) {
    console.error("getAllUsers:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
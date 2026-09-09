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

export const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("changePassword:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const editUser = async (req, res) => {
  try {
    const { userId, name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email }).lean();
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }
    if (name) user.name = name;

    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("editUser:", error.message);
    return res.status(500).json({ message: error.message });
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
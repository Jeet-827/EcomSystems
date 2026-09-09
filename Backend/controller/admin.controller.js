import Admin from "../model/admin.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim();
    const Adminfun = await Admin.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    if (!Adminfun) {
      return res.status(401).json({
        message: "Email not Valid",
      });
    }

    const Ispassword = await bcrypt.compare(password, Adminfun.password);
    if (Adminfun.role?.toLowerCase() !== "admin" || !Ispassword) {
      return res.status(401).json({
        message: "Email and Password Are wrong Please try Again",
      });
    }

    const token = jwt.sign({ id: Adminfun._id }, process.env.ADMINKEY || "admin_secret", {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Admin Login Succesfully",
      success: true,
      token,
      admin: {
        id: Adminfun._id,
        email: Adminfun.email,
        role: Adminfun.role,
      },
    });
  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const Admincreate = async (req, res) => {
  try {
    const { email, password } = req.body;

    const Adminfun = await Admin.findOne({ email });
    if (Adminfun) {
      return res.status(401).json({
        message: "Email not Valid",
      });
    }

    const Ispassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      email,
      password: Ispassword,
    });

    const token = jwt.sign({ id: admin._id }, process.env.ADMINKEY || "admin_secret", {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Admin create Succesfuuly",
      token,
    });
  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const adminupdate = async (req, res) => {
  try {
    const { password, newpassword, email } = req.body;

    let Emailcheack = null;
    if (email) {
      Emailcheack = await Admin.findOne({ email });
    } else if (req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.ADMINKEY || "admin_secret");
        if (decoded?.id) {
          Emailcheack = await Admin.findById(decoded.id);
        }
      } catch (err) {
        console.log("Token verify err:", err.message);
      }
    }

    if (!Emailcheack) {
      Emailcheack = await Admin.findOne();
    }

    if (!Emailcheack) {
      return res.status(404).json({
        message: "something wrong",
      });
    }

    const pass = await bcrypt.compare(password, Emailcheack.password);

    if (!pass) {
      return res.status(400).json({
        message: "Current password is wrong",
      });
    }

    const hash = await bcrypt.hash(newpassword, 10);
    await Admin.findByIdAndUpdate(Emailcheack._id, { password: hash });
    return res.status(200).json({
      message: "Password Updated",
    });
  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const AdminLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "Admin Logout Successfully",
      success: true,
    });
  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });
  }
};

import express from "express";
import User from "../model/user.model.js";

const Alluser = express.Router();

Alluser.get("/alluser", async (req, res) => {
  try {
    const AllUser = await User.find().select("-password").lean();
    return res.status(200).json({
      message: "All user found",
      AllUser,
      users: AllUser,
      data: AllUser,
    });
  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });
  }
});

export default Alluser;

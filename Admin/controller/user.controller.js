import User from "../models/user.model.js";

export const GetAllUser = async (req, res) => {
  try {
    const AllUser = await User.find();
    return res.status(201).json({
      message: "All user found",
      AllUser,
    });
  } catch (error) {

    return res.status(501).json({
      message: error.message,
    });
  }
};

import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const Auth2Middleware = async (req, res, next) => {
  try {
    const Token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null) ||
      req.body?.token;

    if (!Token) {
      return res.status(200).json({ user: null, token: null });
    }

    let decode;
    try {
      decode = jwt.verify(Token, process.env.SECRET_TWO);
    } catch {
      decode = jwt.verify(Token, process.env.SECRET_ONE);
    }

    if (!decode || !decode.id) {
      return res.status(200).json({ user: null, token: null });
    }

    const user = await User.findById(decode.id).select("-password");
    if (!user) {
      return res.status(200).json({ user: null, token: null });
    }

    req.UserId = user._id;
    req.user = user;
    next();
  } catch (error) {

    return res.status(200).json({ user: null, token: null });
  }
};
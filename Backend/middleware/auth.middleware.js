import jwt from "jsonwebtoken";

export const AuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_ONE);
    req.UserId = decoded.id;
    next();
  } catch (error) {

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
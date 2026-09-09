import jwt from "jsonwebtoken";
const Blacklist = {};
const Model = (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    if (Blacklist[token]) {
      return res.status(401).json({ message: "token is not valid" });
    }
    const decode = jwt.verify(token, process.env.SECRET_TWO);

    const accessToken = jwt.sign({ id: decode.id }, process.env.SECRET_ONE, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: decode.id }, process.env.SECRET_TWO, {
      expiresIn: "7d",
    });
    res.cookie("token", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "token created", accessToken });
  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });
  }
};

export default Model;

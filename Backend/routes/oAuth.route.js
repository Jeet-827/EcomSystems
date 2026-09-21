import passport from "../controller/oauth.controller.js";
import { Router } from "express";
import jwt from "jsonwebtoken"
const oAuthRouter = Router();

oAuthRouter.get('/google',passport.authenticate("google",{scope:["email","profile"],session:false}))

oAuthRouter.get('/google/callback',passport.authenticate("google",{session:false, failureRedirect: process.env.FRONTEND_URL}),(req, res) => {
    
  const user = req.user;

  const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_TWO, {
    expiresIn: "7d",
  });
  

  const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("token", refreshToken, cookieOptions);
  res.redirect(`${process.env.FRONTEND_URL}`);
  }
)

export default oAuthRouter
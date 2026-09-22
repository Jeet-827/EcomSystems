import passport from "../controller/oauthgit.controller.js";
import { Router } from "express";
import jwt from "jsonwebtoken";

const oAuthgitRouter = Router();

// GitHub Login
oAuthgitRouter.get(
    "/github",
    passport.authenticate("github", {
        scope: ["user:email"],
        session: false
    })
);

// GitHub Callback
oAuthgitRouter.get(
    "/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: process.env.FRONTEND_URL
    }),
    (req, res) => {

        const user = req.user;

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_TWO,
            {
                expiresIn: "7d"
            }
        );

        const cookieOptions = {
            httpOnly: true,
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            secure:
                process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        res.cookie(
            "token",
            refreshToken,
            cookieOptions
        );

        res.redirect(process.env.FRONTEND_URL);
    }
);

export default oAuthgitRouter;
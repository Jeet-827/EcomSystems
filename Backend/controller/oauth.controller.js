import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../model/user.model.js";
import dotenv from "dotenv"
dotenv.config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL 
    },


    async (accessToken, refreshToken, profile, done)=>{
      try {

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        user = await User.create({
          name: profile.displayName || "Google User",
          email: email,
          googleId: profile.id,
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
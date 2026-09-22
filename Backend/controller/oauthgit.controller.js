import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github-oauth20";
import User from "../model/user.model.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                // GitHub user information
                const githubId = profile.id;
                const username = profile.username;
                const email = profile.emails?.[0]?.value;

                let user = await User.findOne({ githubId });

                if (user) {
                    return done(null, user);
                }

                // 2. Check if same email already exists
                const userEmail = email || `${username || githubId}@github.com`;
                const displayName = profile.displayName || username || "GitHub User";

                if (email) {
                    user = await User.findOne({ email });

                    if (user) {
                        user.githubId = githubId;
                        if (!user.name) user.name = displayName;
                        await user.save();
                        return done(null, user);
                    }
                }

                // 3. Create new user
                user = await User.create({
                    name: displayName,
                    email: userEmail,
                    githubId
                });

                return done(null, user);

            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;

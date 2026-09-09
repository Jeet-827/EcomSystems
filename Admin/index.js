import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import DBConnect from "./config/db.config.js";
import Showorder from "./routes/order.routes.js";
import AdminRoutes from "./routes/admin.routes.js";
import Alluser from "./routes/alluserget.routes.js";
import EditRouter from "./routes/editproduct.routes.js";

const app = express();
DBConnect();

// Security & compression
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  compression({
    level: 6,
    threshold: 1024,
  })
);

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(null, origin || true);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/order", Showorder);
app.use("/api/v1/user", Alluser);
app.use("/api/v1/edit", EditRouter);

app.get("/", (req, res) => {
  res.send("server running");
});

// Global Error Handler Middleware (logs errors to console)
app.use((err, req, res, next) => {
  console.error("❌ Admin Global Express Error:", err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { error: err.message }),
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Admin Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Admin Uncaught Exception:", err);
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.AdminPORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 Admin server running on port ${PORT}`);
  });
}

export default app;

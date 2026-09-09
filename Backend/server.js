import "./config/env.config.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import DBConnect from "./config/db.config.js";
import router from "./routes/user.routes.js";
import ProductRoute from "./routes/product.routes.js";
import productcreate from "./routes/productcreate.routes.js";
import CartRoute from "./routes/cart.routes.js";
import TokenModel from "./routes/token.routes.js";
import OrderRoute from "./routes/order.routes.js";
import SearchRoute from "./routes/search.routes.js";
import RazorPay from "./routes/razor.routes.js";
import AdminRoutes from "./routes/admin.routes.js";
import EditRouter from "./routes/editproduct.routes.js";
import Alluser from "./routes/alluserget.routes.js";
import { getCacheStats, flushAllCache } from "./utils/cache.js";
import { executeInWorkerThread } from "./services/worker.service.js";

const app = express();

// Security & performance
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Cache-Control for product GET APIs
app.use((req, res, next) => {
  if (req.method === "GET" && req.path.startsWith("/api/v1/product")) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
  }
  next();
});

DBConnect();

app.use("/api/v1", router);
app.use("/api/v1/product", ProductRoute);
app.use("/api/v1/productgenereted", productcreate);
app.use("/api/v1/cartdata", CartRoute);
app.use("/api/v1/tokenData", TokenModel);
app.use("/api/v1/order", OrderRoute);
app.use("/api/v1/search", SearchRoute);
app.use("/api/v1/make", RazorPay);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/edit", EditRouter);
app.use("/api/v1/user", Alluser);
app.use("/api/v1/alluser", Alluser);

// Cache Monitoring & Control Routes
app.get("/api/v1/cache/stats", (req, res) => {
  res.json({
    message: "Cache statistics",
    stats: getCacheStats(),
  });
});

app.post("/api/v1/cache/flush", (req, res) => {
  flushAllCache();
  res.json({ message: "Cache flushed successfully" });
});

// Worker Thread Direct Task Execution & Benchmark
app.post("/api/v1/worker/benchmark", async (req, res) => {
  try {
    const iterations = req.body.iterations || 1000000;
    const startTime = Date.now();
    const result = await executeInWorkerThread("HEAVY_COMPUTATION", { iterations });
    const duration = Date.now() - startTime;

    res.json({
      message: "Heavy computation processed in isolated Worker Thread",
      durationMs: duration,
      result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("server is running");
});

// Global Error Handler Middleware (logs errors to console)
app.use((err, req, res, next) => {

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { error: err.message }),
  });
});

process.on("unhandledRejection", (reason, promise) => {

});

process.on("uncaughtException", (err) => {

});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;

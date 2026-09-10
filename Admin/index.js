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

// ================= DATABASE =================

DBConnect();

// ================= SECURITY =================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// ================= COMPRESSION =================

app.use(
  compression({
    level: 6,
    threshold: 1024,
  })
);

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",

  "https://e-commerce-system-frontend.vercel.app",

  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  })
);

// ================= MIDDLEWARE =================

app.use(cookieParser());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ================= ROUTES =================

app.use("/api/v1/admin", AdminRoutes);

app.use("/api/v1/order", Showorder);

app.use("/api/v1/user", Alluser);

app.use("/api/v1/edit", EditRouter);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin server running successfully ",
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= LOCAL SERVER =================

if (!process.env.VERCEL) {
  const PORT = process.env.AdminPORT || 8000;

  app.listen(PORT, () => {
    console.log(`admin server running on port ${PORT}`);
  });
}

// ================= VERCEL =================

export default app;

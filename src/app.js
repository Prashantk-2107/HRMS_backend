import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

// Standard middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL
].filter(Boolean);

const isLocalOrigin = (origin) => {
  // Matches http/https with localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, or 172.16-31.x.x and optional port
  const localRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;
  return localRegex.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files serving
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Apply rate limiter globally to api routes
import { apiRateLimiter } from "./middlewares/rateLimiter.middleware.js";
app.use("/api", apiRateLimiter);

// Mount routes
import authRouter from "./routes/auth.routes.js";
import empRouter from "./routes/employee.routes.js";
import roleRouter from "./routes/role.routes.js";
import documentsRouter from "./routes/documents.routes.js";
import permissionRouter from "./routes/permission.routes.js";
import bankDetailsRouter from "./routes/bank_details.routes.js";
import holidayRouter from "./routes/holiday.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/employee", empRouter);
app.use("/api/v1/role", roleRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/permission", permissionRouter);
app.use("/api/v1/bank-details", bankDetailsRouter);
app.use("/api/v1/holiday", holidayRouter);
app.use("/api/v1/attendance", attendanceRouter);

// Global error handler
app.use(errorHandler);

export default app;

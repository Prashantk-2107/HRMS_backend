import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Standard middlewares
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "*",
  "http://192.168.1.18:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/employee", empRouter);
app.use("/api/v1/role", roleRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/permission", permissionRouter);
app.use("/api/v1/bank-details", bankDetailsRouter);
app.use("/api/v1/holiday", holidayRouter);

// Global error handler
app.use(errorHandler);

export default app;

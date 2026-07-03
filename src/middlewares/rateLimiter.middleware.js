import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const getRemainingTimeString = (resetTime) => {
  if (!resetTime) return "15 minutes";
  const timeLeftMs = resetTime.getTime() - Date.now();
  const timeLeftSec = Math.max(0, Math.ceil(timeLeftMs / 1000));

  if (timeLeftSec < 60) {
    return `${timeLeftSec} second${timeLeftSec !== 1 ? "s" : ""}`;
  }

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;

  if (seconds === 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`;
};

// Rate limiter for authentication-sensitive endpoints
const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: "draft-7", // combines RateLimit headers
  legacyHeaders: false, // disables X-RateLimit-* headers
  handler: (req, res, next, options) => {
    const timeRemaining = getRemainingTimeString(req.rateLimit?.resetTime);
    next(
      new ApiError(
        429,
        `Too many requests to authentication endpoints. Please try again after ${timeRemaining}.`,
      ),
    );
  },
});

// General rate limiter for standard API routes
const apiRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const timeRemaining = getRemainingTimeString(req.rateLimit?.resetTime);
    next(
      new ApiError(
        429,
        `Too many requests from this IP. Please try again after ${timeRemaining}.`,
      ),
    );
  },
});

// Create rate limiter for verify otp
const verifyOtpRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const timeRemaining = getRemainingTimeString(req.rateLimit?.resetTime);
    next(
      new ApiError(
        429,
        `Too many requests to verify otp. Please try again after ${timeRemaining}.`,
      ),
    );
  },
});

export { authRateLimiter, apiRateLimiter, verifyOtpRateLimiter };

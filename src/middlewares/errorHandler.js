import { ApiError } from "../utils/ApiError.js";
import { z } from "zod";

const errorHandler = (err, req, res, next) => {
  let { statusCode, message, error } = err;

  // If the error is not an instance of ApiError, normalize it
  if (!(err instanceof ApiError)) {
    if (err instanceof z.ZodError) {
      statusCode = 400;
      message = "Validation failed";
      error = err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
    } else if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Access token has expired. Please log in again.";
      error = err.message;
    } else if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid access token. Authentication failed.";
      error = err.message;
    } else if (err.code === "P2002") {
      statusCode = 400;
      const targetFields = err.meta?.target || [];
      message = `Unique constraint failed: A record with this ${targetFields.join(", ") || "value"} already exists.`;
      error = err.message;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = err.meta?.cause || "Requested record not found.";
      error = err.message;
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Reference constraint violation: Invalid foreign key relation.";
      error = err.message;
    } else if (err.name === "MulterError" || err.code?.startsWith("LIMIT_")) {
      statusCode = 400;
      if (err.code === "LIMIT_FILE_SIZE") {
        message = "File size exceeds the allowed limit (5MB).";
      } else {
        message = err.message || "File upload error.";
      }
      error = err.message;
    } else {
      statusCode = err.statusCode || 500;
      message = err.message || "Internal Server Error";
      error = err.errors || err.message || err;
    }
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: Array.isArray(error) ? error : [error],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;

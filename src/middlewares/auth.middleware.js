import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const employee = await prisma.employee.findUnique({
    where: { emp_id: decodedToken.emp_id },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!employee) {
    throw new ApiError(401, "Invalid Access Token");
  }

  if (employee.employee_status !== "active") {
    throw new ApiError(403, "Your account is inactive");
  }

  // Optional: Validate session by matching the database token
  if (employee.access_token_set !== token) {
    throw new ApiError(401, "Access Token has expired or been invalidated");
  }

  // Sanitize employee (remove password) before attaching
  const reqEmployee = { ...employee };
  delete reqEmployee.password;

  req.employee = reqEmployee;
  next();
});

export { verifyJWT };

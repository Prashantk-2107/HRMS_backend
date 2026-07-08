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

  if (!decodedToken.session_id) {
    throw new ApiError(401, "Invalid Access Token: No session associated");
  }

  // Retrieve session and associated employee/role details
  const session = await prisma.session.findUnique({
    where: { id: decodedToken.session_id },
    include: {
      employee: {
        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw new ApiError(401, "Session has expired or been invalidated");
  }

  if (session.expires_at < new Date()) {
    // Session has expired, clean it up asynchronously
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    throw new ApiError(401, "Session has expired");
  }

  const employee = session.employee;
  if (!employee) {
    throw new ApiError(401, "Employee associated with this session not found");
  }

  if (employee.employee_status !== "active") {
    throw new ApiError(403, "Your account is inactive");
  }

  // Sanitize employee (remove password) before attaching to request
  const reqEmployee = { ...employee };
  delete reqEmployee.password;

  req.employee = reqEmployee;
  req.session_id = session.id;
  next();
});

export { verifyJWT };

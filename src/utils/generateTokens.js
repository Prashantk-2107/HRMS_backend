import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { ApiError } from "./ApiError.js";
import crypto from "crypto";

const generateAccessAndRefereshTokens = async (employeeId, options = {}) => {
  const { sessionId = null, deviceInfo = null, ipAddress = null } = options;
  try {
    const employee = await prisma.employee.findUnique({
      where: { emp_id: employeeId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    // Parse REFRESH_TOKEN_EXPIRY (e.g. "10d" -> 10 days, "1d" -> 1 day)
    const refreshExpiryStr = process.env.REFRESH_TOKEN_EXPIRY || "10d";
    let expiresAt = new Date();
    const match = refreshExpiryStr.match(/^(\d+)([dmhs])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === "d") expiresAt.setDate(expiresAt.getDate() + value);
      else if (unit === "h") expiresAt.setHours(expiresAt.getHours() + value);
      else if (unit === "m") expiresAt.setMinutes(expiresAt.getMinutes() + value);
      else if (unit === "s") expiresAt.setSeconds(expiresAt.getSeconds() + value);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 10);
    }

    let session;
    if (sessionId) {
      // Rotate token within the same session
      session = await prisma.session.findUnique({
        where: { id: sessionId },
      });
      if (!session) {
        throw new ApiError(401, "Session not found or invalidated");
      }
    } else {
      // Create a brand new session
      session = await prisma.session.create({
        data: {
          emp_id: employeeId,
          refresh_token_hash: "",
          device_info: deviceInfo,
          ip_address: ipAddress,
          expires_at: expiresAt,
        },
      });
    }

    const accessToken = jwt.sign(
      {
        emp_id: employee.emp_id,
        email: employee.email,
        role: employee.role.name,
        session_id: session.id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );

    const refreshToken = jwt.sign(
      {
        emp_id: employee.emp_id,
        session_id: session.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error.message || "Something went wrong while generating tokens");
  }
};

export { generateAccessAndRefereshTokens };

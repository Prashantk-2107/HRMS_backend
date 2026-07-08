import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAccessAndRefereshTokens } from "../../utils/generateTokens.js";
import crypto from "crypto";

async function refreshAccessTokenService(incomingRefreshToken) {
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret"
    );

    if (!decodedToken.session_id) {
      throw new ApiError(401, "Invalid refresh token: No session associated");
    }

    // Hash the incoming refresh token using SHA256 to match the database hash
    const incomingHash = crypto
      .createHash("sha256")
      .update(incomingRefreshToken)
      .digest("hex");

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
      throw new ApiError(401, "Invalid refresh token: Session not found");
    }

    if (session.expires_at < new Date()) {
      // Session has expired, delete it asynchronously
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      throw new ApiError(401, "Session has expired");
    }

    if (session.refresh_token_hash !== incomingHash) {
      throw new ApiError(401, "Refresh token is expired or has been used");
    }

    const employee = session.employee;
    if (!employee) {
      throw new ApiError(401, "Employee associated with this session not found");
    }

    if (employee.employee_status !== "active") {
      throw new ApiError(403, "Your account is inactive. Please contact support.");
    }

    // Rotate tokens by reusing the same session ID
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      employee.emp_id,
      { sessionId: session.id }
    );

    // Sanitize employee details
    const sanitizedEmployee = { ...employee };
    delete sanitizedEmployee.password;

    return {
      accessToken,
      refreshToken,
      employee: sanitizedEmployee,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
}

export { refreshAccessTokenService };

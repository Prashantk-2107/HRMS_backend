import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAccessAndRefereshTokens } from "../../utils/generateTokens.js";

async function refreshAccessTokenService(incomingRefreshToken) {
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret"
    );

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
      throw new ApiError(401, "Invalid refresh token: User not found");
    }

    if (employee.employee_status !== "active") {
      throw new ApiError(403, "Your account is inactive. Please contact support.");
    }

    if (employee.refresh_token_set !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or has been used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      employee.emp_id
    );

    // Sanitize employee details
    const sanitizedEmployee = { ...employee };
    delete sanitizedEmployee.password;
    delete sanitizedEmployee.access_token_set;
    delete sanitizedEmployee.refresh_token_set;

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

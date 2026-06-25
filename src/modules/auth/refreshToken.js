import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { refreshAccessTokenService } from "../../services/auth/refreshToken.js";

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token provided");
  }

  const result = await refreshAccessTokenService(incomingRefreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", result.accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    })
    .json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
    );
});

export { refreshAccessToken };

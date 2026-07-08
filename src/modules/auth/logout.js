import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";

const logoutEmployee = asyncHandler(async (req, res) => {
  // Clear the specific session in the database
  if (req.session_id) {
    await prisma.session.delete({
      where: { id: req.session_id },
    }).catch(() => {});
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "Employee logged out successfully"));
});

export { logoutEmployee };
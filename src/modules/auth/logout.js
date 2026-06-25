import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { updateEmployee } from "../../services/employee/updateEmployee.js";

const logoutEmployee = asyncHandler(async (req, res) => {
  // Clear the tokens in the database
  await updateEmployee(req.employee.emp_id, {
    access_token_set: null,
    refresh_token_set: null,
  });

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
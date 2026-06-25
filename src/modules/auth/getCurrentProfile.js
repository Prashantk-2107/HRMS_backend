import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getCurrentProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Current employee profile retrieved successfully",
        req.employee
      )
    );
});

export { getCurrentProfile };

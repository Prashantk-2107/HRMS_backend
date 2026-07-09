import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getMyLeavesService } from "../../services/leave/getMyLeaves.js";

/**
 * Controller to fetch all leave logs for the logged-in employee.
 */
const getMyLeaves = asyncHandler(async (req, res) => {
  const requests = await getMyLeavesService(req.employee.emp_id);

  return res.status(200).json(
    new ApiResponse(200, "Fetched your leave requests successfully", {
      requests,
    })
  );
});

export { getMyLeaves };

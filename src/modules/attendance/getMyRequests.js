import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getMyRequestsService } from "../../services/attendance/getMyRequests.js";

/**
 * Controller to fetch the logged-in employee's regularization requests history.
 */
const getMyRequests = asyncHandler(async (req, res) => {
  const emp_id = req.employee.emp_id;
  const requests = await getMyRequestsService(emp_id);

  return res.status(200).json(
    new ApiResponse(200, "Fetched correction requests successfully", {
      requests,
    })
  );
});

export { getMyRequests };

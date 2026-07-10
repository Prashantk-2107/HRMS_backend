import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getPendingRequestsService } from "../../services/attendance/getPendingRequests.js";

/**
 * Controller to fetch all pending regularization requests for approval.
 * Accessible only to Super Admin, HR, and Project Manager.
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await getPendingRequestsService();

  return res.status(200).json(
    new ApiResponse(200, "Fetched pending correction requests successfully", {
      requests,
    })
  );
});

export { getPendingRequests };

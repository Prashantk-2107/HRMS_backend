import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getPendingRequestsService } from "../../services/attendance/getPendingRequests.js";

/**
 * Controller to fetch all pending regularization requests for approval.
 * Accessible only to Super Admin, HR, and Project Manager.
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const roleName = req.employee.role?.name?.toLowerCase().replace(/[\s_-]/g, "");
  const hasAccess = ["superadmin", "humanresource", "projectmanager"].includes(roleName);

  if (!hasAccess) {
    throw new ApiError(403, "Forbidden: You do not have permissions to view pending regularization requests.");
  }

  const requests = await getPendingRequestsService();

  return res.status(200).json(
    new ApiResponse(200, "Fetched pending correction requests successfully", {
      requests,
    })
  );
});

export { getPendingRequests };

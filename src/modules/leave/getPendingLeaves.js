import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getPendingLeavesService } from "../../services/leave/getPendingLeaves.js";

/**
 * Controller to fetch all pending leave requests.
 * Restricted to HR/Admin.
 */
const getPendingLeaves = asyncHandler(async (req, res) => {
  const roleName = req.employee.role?.name?.toLowerCase().replace(/[\s_-]/g, "");
  const hasAccess = ["superadmin", "humanresource", "projectmanager"].includes(roleName);

  if (!hasAccess) {
    throw new ApiError(403, "Forbidden: Access denied to view pending leave requests.");
  }

  const requests = await getPendingLeavesService();

  return res.status(200).json(
    new ApiResponse(200, "Fetched pending leave requests successfully", {
      requests,
    })
  );
});

export { getPendingLeaves };

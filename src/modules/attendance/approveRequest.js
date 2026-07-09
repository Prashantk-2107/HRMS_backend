import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { approveRequestService } from "../../services/attendance/approveRequest.js";

/**
 * Controller to approve an attendance regularization request.
 * Accessible only to Super Admin, HR, and Project Manager.
 */
const approveRequest = asyncHandler(async (req, res) => {
  const roleName = req.employee.role?.name?.toLowerCase().replace(/[\s_-]/g, "");
  const hasAccess = ["superadmin", "humanresource", "projectmanager"].includes(roleName);

  if (!hasAccess) {
    throw new ApiError(403, "Forbidden: You do not have permissions to approve regularization requests.");
  }

  const { id } = req.params;
  const request = await approveRequestService(id);

  return res.status(200).json(
    new ApiResponse(200, "Correction request approved successfully", {
      request,
    })
  );
});

export { approveRequest };

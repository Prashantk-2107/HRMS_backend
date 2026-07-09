import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { approveLeaveRequestService } from "../../services/leave/approveRequest.js";

/**
 * Controller to approve an employee's leave request.
 * Restricted to HR/Admin.
 */
const approveRequest = asyncHandler(async (req, res) => {
  const roleName = req.employee.role?.name?.toLowerCase().replace(/[\s_-]/g, "");
  const hasAccess = ["superadmin", "humanresource", "projectmanager"].includes(roleName);

  if (!hasAccess) {
    throw new ApiError(403, "Forbidden: Access denied to approve leave requests.");
  }

  const { id } = req.params;
  const request = await approveLeaveRequestService(id);

  return res.status(200).json(
    new ApiResponse(200, "Leave request approved successfully", {
      request,
    })
  );
});

export { approveRequest };

import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { rejectLeaveSchema } from "../../validations/leave.validation.js";
import { rejectLeaveRequestService } from "../../services/leave/rejectRequest.js";

/**
 * Controller to reject an employee's leave request.
 * Restricted to HR/Admin.
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const roleName = req.employee.role?.name?.toLowerCase().replace(/[\s_-]/g, "");
  const hasAccess = ["superadmin", "humanresource", "projectmanager"].includes(roleName);

  if (!hasAccess) {
    throw new ApiError(403, "Forbidden: Access denied to reject leave requests.");
  }

  const { id } = req.params;
  const parsed = rejectLeaveSchema.parse(req.body);

  const request = await rejectLeaveRequestService({
    id,
    rejection_reason: parsed.rejection_reason,
  });

  return res.status(200).json(
    new ApiResponse(200, "Leave request rejected successfully", {
      request,
    })
  );
});

export { rejectRequest };

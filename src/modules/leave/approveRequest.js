import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { approveLeaveRequestService } from "../../services/leave/approveRequest.js";

/**
 * Controller to approve an employee's leave request.
 * Restricted to HR/Admin.
 */
const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const request = await approveLeaveRequestService(id);

  return res.status(200).json(
    new ApiResponse(200, "Leave request approved successfully", {
      request,
    })
  );
});

export { approveRequest };

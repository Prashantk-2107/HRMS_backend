import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { approveRequestService } from "../../services/attendance/approveRequest.js";

/**
 * Controller to approve an attendance regularization request.
 * Accessible only to Super Admin, HR, and Project Manager.
 */
const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const request = await approveRequestService(id);

  return res.status(200).json(
    new ApiResponse(200, "Correction request approved successfully", {
      request,
    })
  );
});

export { approveRequest };

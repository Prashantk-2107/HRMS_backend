import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { rejectRequestService } from "../../services/attendance/rejectRequest.js";
import { rejectRegularizationSchema } from "../../validations/regularization.validation.js";

/**
 * Controller to reject an attendance regularization request.
 * Accessible only to Super Admin, HR, and Project Manager.
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const validation = rejectRegularizationSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const { id } = req.params;
  const { rejection_reason } = validation.data;
  
  const request = await rejectRequestService(id, rejection_reason);

  return res.status(200).json(
    new ApiResponse(200, "Correction request rejected successfully", {
      request,
    })
  );
});

export { rejectRequest };

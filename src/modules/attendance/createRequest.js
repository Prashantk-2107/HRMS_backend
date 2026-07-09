import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createRequestService } from "../../services/attendance/createRequest.js";
import { createRegularizationSchema } from "../../validations/regularization.validation.js";

/**
 * Controller to create a new attendance correction request.
 */
const createRequest = asyncHandler(async (req, res) => {
  const validation = createRegularizationSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const emp_id = req.employee.emp_id;
  const request = await createRequestService(emp_id, validation.data);

  return res.status(201).json(
    new ApiResponse(201, "Correction request submitted successfully", {
      request,
    })
  );
});

export { createRequest };

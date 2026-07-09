import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { checkInService } from "../../services/attendance/checkIn.js";
import { checkInSchema } from "../../validations/attendance.validation.js";

/**
 * Controller to handle employee check-in request.
 */
const checkIn = asyncHandler(async (req, res) => {
  const validation = checkInSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const emp_id = req.employee.emp_id;
  const attendance = await checkInService(emp_id, validation.data);

  return res.status(201).json(
    new ApiResponse(201, "Checked in successfully", {
      attendance,
    })
  );
});

export { checkIn };

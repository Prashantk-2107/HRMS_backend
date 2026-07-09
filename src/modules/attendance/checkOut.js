import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { checkOutService } from "../../services/attendance/checkOut.js";
import { checkOutSchema } from "../../validations/attendance.validation.js";

/**
 * Controller to handle employee check-out request.
 */
const checkOut = asyncHandler(async (req, res) => {
  const validation = checkOutSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const emp_id = req.employee.emp_id;
  const attendance = await checkOutService(emp_id, validation.data);

  return res.status(200).json(
    new ApiResponse(200, "Checked out successfully", {
      attendance,
    })
  );
});

export { checkOut };

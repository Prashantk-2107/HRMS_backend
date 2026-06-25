import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { updateEmployeeProfileService } from "../../services/employee/updateEmployeeProfile.js";
import { updateEmployeeSchema } from "../../validations/employee.validation.js";

/**
 * Controller to handle employee profile updates for basic/allowed details.
 * Delegates core updating, constraints validation, and sanitization to service layer.
 */
const updateEmp = asyncHandler(async (req, res) => {
  const validation = updateEmployeeSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  // Delegate core update logic and uniqueness checks to the service
  const sanitizedEmployee = await updateEmployeeProfileService(
    req.employee.emp_id,
    validation.data,
  );

  return res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", {
      employee: sanitizedEmployee,
    }),
  );
});

export { updateEmp };

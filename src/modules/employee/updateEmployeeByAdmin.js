import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";
import { updateEmployeeProfileService } from "../../services/employee/updateEmployeeProfile.js";
import { adminUpdateEmployeeSchema } from "../../validations/employee.validation.js";

/**
 * Controller to handle employee profile updates by an authorized admin/HR.
 * Accessible by authorized roles (via emp:update permission).
 */
const updateEmployeeByAdmin = asyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  // Validate UUID format for emp_id
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(emp_id)) {
    throw new ApiError(400, "Invalid employee ID format");
  }

  const validation = adminUpdateEmployeeSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const updateData = { ...validation.data };

  // Parse date strings to JS Date objects if provided
  if (updateData.joining_date) {
    updateData.joining_date = new Date(updateData.joining_date);
  }
  if (updateData.date_of_birth) {
    updateData.date_of_birth = new Date(updateData.date_of_birth);
  }

  // Verify role existence if role_id is provided in the body
  if (updateData.role_id) {
    const roleExists = await prisma.role.findUnique({
      where: { role_id: updateData.role_id },
    });
    if (!roleExists) {
      throw new ApiError(400, "Invalid Role ID: Role does not exist.");
    }
  }

  // Delegate update operation to the service layer
  const updatedEmployee = await updateEmployeeProfileService(emp_id, updateData);

  return res.status(200).json(
    new ApiResponse(200, "Employee profile updated successfully by admin", {
      employee: updatedEmployee,
    })
  );
});

export { updateEmployeeByAdmin };

import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { assignRoleService } from "../../services/employee/assignRole.js";
import { assignRoleSchema } from "../../validations/employee.validation.js";

/**
 * Controller to assign/change employee role.
 * Accessible by Super_admin, Human Resource, and Project_manager (via emp:assign_role permission).
 */
const assignRole = asyncHandler(async (req, res) => {
  const validation = assignRoleSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const { emp_id, role_id } = validation.data;

  // Prevent self-role modification (request context constraint)
  if (req.employee?.emp_id === emp_id) {
    throw new ApiError(400, "Forbidden: You cannot change your own role");
  }

  // Delegate logic and DB update to service layer
  const sanitizedEmployee = await assignRoleService(emp_id, role_id);

  return res.status(200).json(
    new ApiResponse(200, "Role assigned successfully", {
      employee: sanitizedEmployee,
    }),
  );
});

export { assignRole };

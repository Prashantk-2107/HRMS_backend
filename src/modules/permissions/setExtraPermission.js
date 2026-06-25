import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { setExtraPermissionService } from "../../services/employee/setExtraPermission.js";
import { setExtraPermissionSchema } from "../../validations/permission.validation.js";

/**
 * Controller to set or update extra permissions for a particular employee.
 * Accessible by authorized roles (via role:update or emp:assign_role permission).
 */
const setExtraPermission = asyncHandler(async (req, res) => {
  const validation = setExtraPermissionSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const { emp_id, permission_id, isGranted } = validation.data;

  // Delegate business logic and database operation to the service layer
  const extraPermission = await setExtraPermissionService(emp_id, permission_id, isGranted);

  return res.status(200).json(
    new ApiResponse(200, "Extra permission set successfully", {
      extraPermission,
    }),
  );
});

export { setExtraPermission };

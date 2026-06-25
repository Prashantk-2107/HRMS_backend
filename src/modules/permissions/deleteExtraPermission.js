import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { deleteExtraPermissionService } from "../../services/employee/deleteExtraPermission.js";
import { deleteExtraPermissionSchema } from "../../validations/permission.validation.js";

/**
 * Controller to delete/remove an extra permission override for a particular employee.
 * Accessible by authorized roles (via emp:assign_role permission).
 */
const deleteExtraPermission = asyncHandler(async (req, res) => {
  const validation = deleteExtraPermissionSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const { emp_id, permission_id } = validation.data;

  // Delegate business logic and database deletion to service layer
  const deletedPermission = await deleteExtraPermissionService(emp_id, permission_id);

  return res.status(200).json(
    new ApiResponse(200, "Extra permission override deleted successfully", {
      deletedPermission,
    })
  );
});

export { deleteExtraPermission };

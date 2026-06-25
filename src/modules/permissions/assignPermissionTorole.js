import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { assignPermissionToRoleService } from "../../services/role/assignPermissionToRole.js";
import { assignPermissionToRoleSchema } from "../../validations/permission.validation.js";

/**
 * Controller to assign a permission to a role.
 * Accessible by authorized roles (via role:update permission).
 */
const assignPermissionToRole = asyncHandler(async (req, res) => {
  const validation = assignPermissionToRoleSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const { role_id, permission_id } = validation.data;

  // Delegate business logic and database operation to service layer
  const rolePermission = await assignPermissionToRoleService(role_id, permission_id);

  return res.status(200).json(
    new ApiResponse(200, "Permission assigned to role successfully", {
      rolePermission,
    })
  );
});

export { assignPermissionToRole };

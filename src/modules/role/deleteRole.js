import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { deleteRoleService } from "../../services/role/deleteRole.js";

/**
 * Controller to delete a role.
 * Accessible only by roles with the 'role:delete' permission (Super_admin).
 */
const deleteRole = asyncHandler(async (req, res) => {
  const { role_id } = req.params;

  // Validate UUID format for safety
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(role_id)) {
    throw new ApiError(400, "Invalid role ID format");
  }

  // Delegate logic and DB update to service layer
  const deletedRole = await deleteRoleService(role_id);

  return res.status(200).json(
    new ApiResponse(200, "Role deleted successfully", {
      role: deletedRole,
    })
  );
});

export { deleteRole };

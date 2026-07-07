import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";

/**
 * Controller to fetch all permissions associated with a specific role.
 * Accessible by authorized roles (via role:get_all permission).
 */
const getAllRolePermission = asyncHandler(async (req, res) => {
  const { role_id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(role_id)) {
    throw new ApiError(400, "Invalid role ID format");
  }

  // 1. Verify target role exists
  const role = await prisma.role.findUnique({
    where: { role_id },
  });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  // 2. Fetch role permissions
  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role_id,
    },
    include: {
      permission: true,
    },
  });

  // 3. Filter active permissions and map to clean output
  const permissions = rolePermissions
    .filter((rp) => rp.isGranted && rp.permission && rp.permission.is_active)
    .map((rp) => rp.permission);

  return res.status(200).json(
    new ApiResponse(200, "Role permissions retrieved successfully", {
      role: {
        role_id: role.role_id,
        name: role.name,
        description: role.description,
      },
      permissions,
    })
  );
});

export { getAllRolePermission };

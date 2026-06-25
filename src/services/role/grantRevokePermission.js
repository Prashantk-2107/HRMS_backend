import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to grant or revoke a permission for a role in the database.
 * @param {string} role_id - The target role ID (UUID).
 * @param {string} permission_id - The target permission ID (UUID).
 * @param {boolean} isGranted - Whether the permission is granted (true) or revoked (false) for the role.
 * @returns {Promise<object>} The upserted/updated RolePermission record.
 */
async function grantRevokePermissionService(role_id, permission_id, isGranted) {
  // Verify target role exists
  const targetRole = await prisma.role.findUnique({
    where: { role_id },
  });

  if (!targetRole) {
    throw new ApiError(404, "Role not found");
  }

  // Verify target permission exists
  const targetPermission = await prisma.permission.findUnique({
    where: { permission_id },
  });

  if (!targetPermission) {
    throw new ApiError(404, "Permission not found");
  }

  try {
    // Upsert the role-permission association with the new isGranted status
    const rolePermission = await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id,
          permission_id,
        },
      },
      update: {
        isGranted,
      },
      create: {
        role_id,
        permission_id,
        isGranted,
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
        permission: {
          select: {
            name: true,
          },
        },
      },
    });

    return rolePermission;
  } catch (error) {
    throw new ApiError(500, "Internal Server Error occurred while granting/revoking permission for role.");
  }
}

export { grantRevokePermissionService };

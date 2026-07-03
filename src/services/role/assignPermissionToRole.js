import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { getRequiredDependencies } from "../../utils/permissionDependencies.js";

/**
 * Service to validate and execute assigning a permission to a role.
 * @param {string} role_id - The target role ID (UUID).
 * @param {string} permission_id - The target permission ID (UUID).
 * @returns {Promise<object>} The created RolePermission record.
 */
async function assignPermissionToRoleService(role_id, permission_id) {
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

  // Validate dependencies
  const dependencies = getRequiredDependencies(targetPermission.name);
  if (dependencies.length > 0) {
    const activeRolePermissions = await prisma.rolePermission.findMany({
      where: {
        role_id,
        isGranted: true,
        permission: {
          name: { in: dependencies },
        },
      },
      include: { permission: true },
    });
    const activeNames = activeRolePermissions.map((rp) => rp.permission.name);
    const missing = dependencies.filter((dep) => !activeNames.includes(dep));
    if (missing.length > 0) {
      throw new ApiError(
        400,
        `Cannot assign permission '${targetPermission.name}' because the following required permissions are missing: ${missing.join(", ")}`
      );
    }
  }

  // Check if role already has this permission
  const existingAssociation = await prisma.rolePermission.findUnique({
    where: {
      role_id_permission_id: {
        role_id,
        permission_id,
      },
    },
  });

  if (existingAssociation) {
    throw new ApiError(400, "Permission is already assigned to this role");
  }

  try {
    const rolePermission = await prisma.rolePermission.create({
      data: {
        role_id,
        permission_id,
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
    throw new ApiError(500, "Internal Server Error occurred while assigning permission to role.");
  }
}

export { assignPermissionToRoleService };

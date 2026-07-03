import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { getRequiredDependencies } from "../../utils/permissionDependencies.js";

/**
 * Service to delete/remove an ExtraPermission override for an employee.
 * Verifies if the permission override is currently assigned.
 * @param {string} emp_id - The target employee UUID.
 * @param {string} permission_id - The target permission UUID.
 * @returns {Promise<object>} The deleted ExtraPermission record.
 */
async function deleteExtraPermissionService(emp_id, permission_id) {
  // Check if the permission override is currently assigned
  const existingPermission = await prisma.extraPermission.findUnique({
    where: {
      emp_id_permission_id: {
        emp_id,
        permission_id,
      },
    },
  });

  if (!existingPermission) {
    throw new ApiError(404, "Extra permission override is not assigned to this employee");
  }

  // Get target permission details first
  const targetPermission = await prisma.permission.findUnique({
    where: { permission_id },
  });

  if (!targetPermission) {
    throw new ApiError(404, "Permission not found");
  }

  // 1. Fetch role-based permissions
  const employee = await prisma.employee.findUnique({
    where: { emp_id },
    select: { role_id: true }
  });

  if (employee) {
    const rolePermissionsRaw = await prisma.rolePermission.findMany({
      where: { role_id: employee.role_id, isGranted: true },
      include: { permission: true }
    });
    const rolePermissions = rolePermissionsRaw
      .filter(rp => rp.permission && rp.permission.is_active)
      .map(rp => rp.permission);

    // 2. Fetch extra permissions EXCEPT the one being deleted
    const extraPermissionsRaw = await prisma.extraPermission.findMany({
      where: { emp_id, NOT: { permission_id } },
      include: { permission: true }
    });
    const extraPermissions = extraPermissionsRaw
      .map(ep => {
        if (!ep.permission) return null;
        return {
          permission_id: ep.permission.permission_id,
          name: ep.permission.name,
          is_active: ep.permission.is_active,
          isGranted: ep.isGranted
        };
      })
      .filter(Boolean);

    // 3. Compute simulated effective permissions
    const effectiveMap = new Map();
    for (const perm of rolePermissions) {
      effectiveMap.set(perm.permission_id, perm);
    }
    for (const ep of extraPermissions) {
      if (ep.isGranted) {
        if (ep.is_active) {
          effectiveMap.set(ep.permission_id, {
            permission_id: ep.permission_id,
            name: ep.name,
            is_active: ep.is_active
          });
        }
      } else {
        effectiveMap.delete(ep.permission_id);
      }
    }
    const simulatedNames = Array.from(effectiveMap.values()).map(ep => ep.name);

    // 4. Validate all simulated effective permissions satisfy dependencies
    for (const name of simulatedNames) {
      const dependencies = getRequiredDependencies(name);
      const missing = dependencies.filter(dep => !simulatedNames.includes(dep));
      if (missing.length > 0) {
        throw new ApiError(
          400,
          `Cannot remove extra permission override because the remaining active permission '${name}' requires: ${missing.join(', ')}`
        );
      }
    }
  }

  try {
    const deletedPermission = await prisma.extraPermission.delete({
      where: {
        emp_id_permission_id: {
          emp_id,
          permission_id,
        },
      },
    });

    return deletedPermission;
  } catch (error) {
    throw new ApiError(500, "Internal Server Error occurred while deleting extra permission.");
  }
}

export { deleteExtraPermissionService };

import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to fetch and calculate role-based, overridden, and effective permissions for an employee.
 * @param {string} emp_id - The employee UUID.
 * @returns {Promise<object>} Object containing rolePermissions, extraPermissions, and effectivePermissions.
 */
async function getAllEmpPermissionService(emp_id) {
  // 1. Verify target employee exists
  const employee = await prisma.employee.findUnique({
    where: { emp_id },
    select: {
      emp_id: true,
      role_id: true,
    },
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  // 2. Fetch role-based permissions
  const rolePermissionsRaw = await prisma.rolePermission.findMany({
    where: {
      role_id: employee.role_id,
    },
    include: {
      permission: true,
    },
  });

  // 3. Fetch user-specific extra permissions
  const extraPermissionsRaw = await prisma.extraPermission.findMany({
    where: {
      emp_id,
    },
    include: {
      permission: true,
    },
  });

  // 4. Sanitize outputs
  const rolePermissions = rolePermissionsRaw
    .filter((rp) => rp.isGranted && rp.permission && rp.permission.is_active)
    .map((rp) => rp.permission);

  const extraPermissions = extraPermissionsRaw
    .map((ep) => {
      if (!ep.permission) return null;
      return {
        permission_id: ep.permission.permission_id,
        name: ep.permission.name,
        is_active: ep.permission.is_active,
        isGranted: ep.isGranted,
      };
    })
    .filter(Boolean);

  // 5. Calculate effective permissions
  const effectiveMap = new Map();

  // Populate from role
  for (const perm of rolePermissions) {
    effectiveMap.set(perm.permission_id, perm);
  }

  // Apply overrides
  for (const ep of extraPermissions) {
    if (ep.isGranted) {
      if (ep.is_active) {
        effectiveMap.set(ep.permission_id, {
          permission_id: ep.permission_id,
          name: ep.name,
          is_active: ep.is_active,
        });
      }
    } else {
      effectiveMap.delete(ep.permission_id);
    }
  }

  const effectivePermissions = Array.from(effectiveMap.values());

  return {
    rolePermissions,
    extraPermissions,
    effectivePermissions,
  };
}

export { getAllEmpPermissionService };

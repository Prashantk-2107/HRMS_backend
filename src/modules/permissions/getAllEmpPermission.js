import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getAllEmpPermissionService } from "../../services/employee/getAllEmpPermission.js";
import prisma from "../../config/db.js";

/**
 * Helper to check if a requester has any of the specified permissions.
 */
async function hasPermission(emp_id, role_id, permissionNames) {
  const permissions = await prisma.permission.findMany({
    where: {
      name: { in: permissionNames },
      is_active: true,
    },
  });

  if (permissions.length === 0) return false;
  const permIds = permissions.map((p) => p.permission_id);

  // Check ExtraPermission overrides first
  const extraPermissions = await prisma.extraPermission.findMany({
    where: {
      emp_id,
      permission_id: { in: permIds },
    },
  });

  const overrides = new Map(extraPermissions.map((ep) => [ep.permission_id, ep.isGranted]));

  for (const perm of permissions) {
    const override = overrides.get(perm.permission_id);
    if (override === true) {
      return true; // Explicitly granted
    }
    if (override === false) {
      continue; // Explicitly revoked for this permission name
    }

    // Fallback to role check
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role_id,
        permission_id: perm.permission_id,
      },
    });

    if (rolePermission && rolePermission.isGranted) {
      return true;
    }
  }

  return false;
}

/**
 * Controller to fetch all permissions (role, extra overrides, and final effective permissions) of an employee.
 * Accessible by:
 * - The employee themselves (self-query)
 * - Users with 'emp:view_any' or 'emp:grant_extra_permission' permissions
 */
const getAllEmpPermission = asyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(emp_id)) {
    throw new ApiError(400, "Invalid employee ID format");
  }

  // Authorization check: User can query self, or must have emp:view_any / emp:grant_extra_permission
  if (req.employee.emp_id !== emp_id) {
    const authorized = await hasPermission(
      req.employee.emp_id,
      req.employee.role_id,
      ["emp:view_any", "emp:grant_extra_permission"]
    );

    if (!authorized) {
      throw new ApiError(403, "Forbidden: You are not authorized to view this employee's permissions");
    }
  }

  // Fetch resolved permissions from service layer
  const result = await getAllEmpPermissionService(emp_id);

  return res.status(200).json(
    new ApiResponse(200, "Employee permissions retrieved successfully", result)
  );
});

export { getAllEmpPermission };

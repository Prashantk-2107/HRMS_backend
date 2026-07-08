import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to check if the authenticated employee has the required permission.
 *
 * @param {string} requiredPermission - The name of the permission to check (e.g. "user:create")
 * @returns {Function} Express middleware function
 */
const checkPermission = (requiredPermission) => {
  if (!requiredPermission) {
    throw new Error(
      "Permission name is required to initialize checkPermission middleware",
    );
  }

  return asyncHandler(async (req, res, next) => {
    // Extract standardized employee from request context
    const employee = req.employee;

    if (!employee) {
      throw new ApiError(
        401,
        "Unauthorized: Employee is not authenticated. Please log in.",
      );
    }

    if (!employee.role_id) {
      throw new ApiError(403, "Forbidden: User does not have a role assigned.");
    }

    // 1. Consolidate Target Permission, Extra Overrides, and Role Permissions in a single query
    const employeeWithPermissions = await prisma.employee.findUnique({
      where: { emp_id: employee.emp_id },
      select: {
        extraPermissions: {
          where: {
            permission: {
              name: requiredPermission,
              is_active: true,
            },
          },
          select: {
            isGranted: true,
          },
        },
        role: {
          select: {
            rolePermissions: {
              where: {
                permission: {
                  name: requiredPermission,
                  is_active: true,
                },
              },
              select: {
                isGranted: true,
              },
            },
          },
        },
      },
    });

    if (!employeeWithPermissions) {
      throw new ApiError(401, "Unauthorized: Employee record not found.");
    }

    const { extraPermissions, role } = employeeWithPermissions;

    // 2. First check the extra permission override (specific to this employee)
    if (extraPermissions && extraPermissions.length > 0) {
      if (extraPermissions[0].isGranted) {
        return next();
      } else {
        throw new ApiError(
          403,
          `Forbidden: You do not have the required permission (${requiredPermission}) to perform this action.`,
        );
      }
    }

    // 3. Fallback to standard role-based permission checks
    const rolePermissions = role?.rolePermissions || [];
    if (rolePermissions.length > 0) {
      if (rolePermissions[0].isGranted) {
        return next();
      }
    }

    // Default fallback: Permission not found, inactive, or not granted
    throw new ApiError(
      403,
      `Forbidden: You do not have the required permission (${requiredPermission}) to perform this action.`,
    );
  });
};

export { checkPermission };

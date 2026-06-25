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

    // 1. Find the target permission first to get its ID
    const targetPermission = await prisma.permission.findFirst({
      where: {
        name: requiredPermission,
        is_active: true,
      },
    });

    if (!targetPermission) {
      throw new ApiError(
        403,
        `Forbidden: The required permission (${requiredPermission}) does not exist or is inactive.`,
      );
    }

    // 2. Check if there is an override in ExtraPermission for this employee
    const extraPermission = await prisma.extraPermission.findFirst({
      where: {
        emp_id: employee.emp_id,
        permission_id: targetPermission.permission_id,
      },
    });

    if (extraPermission !== null) {
      if (!extraPermission.isGranted) {
        throw new ApiError(
          403,
          `Forbidden: You do not have the required permission (${requiredPermission}) to perform this action.`,
        );
      }
      return next();
    }

    // 3. Fallback to role-based permission check
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role_id: employee.role_id,
        permission_id: targetPermission.permission_id,
      },
    });

    if (!rolePermission || !rolePermission.isGranted) {
      throw new ApiError(
        403,
        `Forbidden: You do not have the required permission (${requiredPermission}) to perform this action.`,
      );
    }

    next();
  });
};

export { checkPermission };

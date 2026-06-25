import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to validate and upsert an ExtraPermission record for an employee.
 * @param {string} emp_id - The target employee UUID.
 * @param {string} permission_id - The target permission UUID.
 * @param {boolean} isGranted - Whether the permission is granted (true) or revoked (false).
 * @returns {Promise<object>} The upserted ExtraPermission record.
 */
async function setExtraPermissionService(emp_id, permission_id, isGranted) {
  // Verify target employee exists
  const targetEmployee = await prisma.employee.findUnique({
    where: { emp_id },
  });

  if (!targetEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  // Verify target permission exists
  const targetPermission = await prisma.permission.findUnique({
    where: { permission_id },
  });

  if (!targetPermission) {
    throw new ApiError(404, "Permission not found");
  }

  try {
    const extraPermission = await prisma.extraPermission.upsert({
      where: {
        emp_id_permission_id: {
          emp_id,
          permission_id,
        },
      },
      update: {
        isGranted,
      },
      create: {
        emp_id,
        permission_id,
        isGranted,
      },
    });

    return extraPermission;
  } catch (error) {
    throw new ApiError(500, "Internal Server Error occurred while setting extra permission.");
  }
}

export { setExtraPermissionService };

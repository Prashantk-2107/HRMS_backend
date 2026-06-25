import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

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

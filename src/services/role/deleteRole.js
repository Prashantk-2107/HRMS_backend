import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to validate constraints and delete a role.
 * @param {string} role_id - The target role ID.
 * @returns {Promise<object>} The deleted role record details.
 */
async function deleteRoleService(role_id) {
  // 1. Verify role exists
  const role = await prisma.role.findUnique({
    where: { role_id },
  });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  // 2. Prevent deleting the Super_admin role
  const normalizedName = role.name
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "_");

  if (normalizedName === "super_admin") {
    throw new ApiError(
      400,
      "Forbidden: The Super_admin role is protected and cannot be deleted"
    );
  }

  // 3. Prevent deleting roles currently assigned to employees
  const assignedEmployeeCount = await prisma.employee.count({
    where: { role_id },
  });

  if (assignedEmployeeCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete role because it is currently assigned to ${assignedEmployeeCount} employee(s)`
    );
  }

  try {
    // 4. Delete the role
    const deletedRole = await prisma.role.delete({
      where: { role_id },
    });

    return deletedRole;
  } catch (error) {
    throw new ApiError(
      500,
      "Internal Server Error occurred while deleting the role."
    );
  }
}

export { deleteRoleService };

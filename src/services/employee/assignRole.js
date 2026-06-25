import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to validate and execute employee role update.
 * @param {string} emp_id - The target employee ID.
 * @param {string} role_id - The target role ID.
 * @returns {Promise<object>} The sanitized updated employee object.
 */
async function assignRoleService(emp_id, role_id) {
  // Verify target employee exists
  const targetEmployee = await prisma.employee.findUnique({
    where: { emp_id },
  });

  if (!targetEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  // Verify target role exists
  const targetRole = await prisma.role.findUnique({
    where: { role_id },
  });

  if (!targetRole) {
    throw new ApiError(404, "Role not found");
  }

  // Check if target employee already has the role
  if (targetEmployee.role_id === role_id) {
    throw new ApiError(400, "Employee already has this role assigned");
  }

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { emp_id },
      data: { role_id },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Sanitize employee record (remove sensitive tokens/passwords)
    const sanitizedEmployee = { ...updatedEmployee };
    delete sanitizedEmployee.password;
    delete sanitizedEmployee.access_token_set;
    delete sanitizedEmployee.refresh_token_set;

    return sanitizedEmployee;
  } catch (error) {
    throw new ApiError(500, "Internal Server Error occurred while assigning role.");
  }
}

export { assignRoleService };

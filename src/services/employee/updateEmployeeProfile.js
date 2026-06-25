import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to execute employee self-profile updates and check validations.
 * @param {string} emp_id - The ID of the employee being updated.
 * @param {object} updateData - Allowed update fields.
 * @returns {Promise<object>} The updated, sanitized employee object.
 */
async function updateEmployeeProfileService(emp_id, updateData) {
  const { phone_number } = updateData;

  if (phone_number !== undefined) {
    // Verify phone number uniqueness
    const existing = await prisma.employee.findFirst({
      where: {
        phone_number,
        emp_id: { not: emp_id },
      },
    });
    if (existing) {
      throw new ApiError(
        400,
        "Phone number is already in use by another employee",
      );
    }
  }

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { emp_id },
      data: updateData,
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Sanitize employee record
    const sanitizedEmployee = { ...updatedEmployee };
    delete sanitizedEmployee.password;
    delete sanitizedEmployee.access_token_set;
    delete sanitizedEmployee.refresh_token_set;

    return sanitizedEmployee;
  } catch (error) {
    throw error;
  }
}

export { updateEmployeeProfileService };

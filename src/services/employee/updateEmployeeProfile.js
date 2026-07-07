import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to execute employee self-profile updates and check validations.
 * @param {string} emp_id - The ID of the employee being updated.
 * @param {object} updateData - Allowed update fields.
 * @returns {Promise<object>} The updated, sanitized employee object.
 */
async function updateEmployeeProfileService(emp_id, updateData) {
  let formattedPhoneNumber = undefined;
  if (updateData.phone_number !== undefined) {
    formattedPhoneNumber = (updateData.phone_number && updateData.phone_number.trim() !== "") ? updateData.phone_number.trim() : null;
    updateData.phone_number = formattedPhoneNumber;
  }

  let formattedEmergencyNumber = undefined;
  if (updateData.emergency_contact_number !== undefined) {
    formattedEmergencyNumber = (updateData.emergency_contact_number && updateData.emergency_contact_number.trim() !== "") ? updateData.emergency_contact_number.trim() : null;
    updateData.emergency_contact_number = formattedEmergencyNumber;
  }

  // 1. Verify phone number uniqueness
  if (formattedPhoneNumber) {
    const existing = await prisma.employee.findFirst({
      where: {
        phone_number: formattedPhoneNumber,
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

  // 2. Verify emergency contact number uniqueness
  if (formattedEmergencyNumber) {
    const existingEmergency = await prisma.employee.findFirst({
      where: {
        emergency_contact_number: formattedEmergencyNumber,
        emp_id: { not: emp_id },
      },
    });
    if (existingEmergency) {
      throw new ApiError(
        400,
        "Emergency contact number is already in use by another employee",
      );
    }
  }

  // 3. Verify date of birth and joining date compatibility
  if (updateData.date_of_birth !== undefined || updateData.joining_date !== undefined) {
    const currentEmployee = await prisma.employee.findUnique({
      where: { emp_id },
      select: { date_of_birth: true, joining_date: true },
    });

    if (currentEmployee) {
      const mergedDob = updateData.date_of_birth !== undefined ? updateData.date_of_birth : currentEmployee.date_of_birth;
      const mergedDoj = updateData.joining_date !== undefined ? updateData.joining_date : currentEmployee.joining_date;

      if (mergedDob) {
        const dobDate = new Date(mergedDob);
        if (dobDate > new Date()) {
          throw new ApiError(400, "Date of birth cannot be in the future.");
        }
        if (mergedDoj) {
          const dojDate = new Date(mergedDoj);
          if (dojDate < dobDate) {
            throw new ApiError(400, "Date of joining cannot be before date of birth.");
          }
        }
      }
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

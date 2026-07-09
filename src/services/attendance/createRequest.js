import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to create a new attendance regularization request.
 * 
 * @param {string} emp_id - ID of the employee submitting the request
 * @param {Object} data - Contains attendance_id, check_in, check_out, reason
 * @returns {Promise<Object>} The created regularization request
 */
async function createRequestService(emp_id, data) {
  const { attendance_id, check_in, check_out, reason } = data;

  // 1. Verify the attendance log exists and belongs to the employee
  const attendance = await prisma.attendance.findUnique({
    where: {
      id: attendance_id,
    },
  });

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found.");
  }

  if (attendance.emp_id !== emp_id) {
    throw new ApiError(403, "You can only request corrections for your own attendance.");
  }

  // 2. Check if a pending regularization request already exists for this attendance record
  const existingPending = await prisma.attendanceRegularization.findFirst({
    where: {
      attendance_id,
      status: "pending",
    },
  });

  if (existingPending) {
    throw new ApiError(400, "You already have a pending correction request for this attendance record.");
  }

  // 3. Create the regularization request
  try {
    const request = await prisma.attendanceRegularization.create({
      data: {
        attendance_id,
        emp_id,
        requested_date: attendance.attendance_date,
        check_in: check_in ? new Date(check_in) : null,
        check_out: check_out ? new Date(check_out) : null,
        reason,
        status: "pending",
      },
    });
    return request;
  } catch (error) {
    throw new ApiError(500, "An error occurred while creating regularization request.");
  }
}

export { createRequestService };

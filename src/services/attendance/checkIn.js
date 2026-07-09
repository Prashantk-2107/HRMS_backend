import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to handle employee check-in.
 * 
 * @param {string} emp_id - ID of the employee
 * @param {Object} data - Payload containing optional check_in_time and date
 * @returns {Promise<Object>} The created attendance record
 */
async function checkInService(emp_id, data) {
  const { date, check_in_time } = data;

  const checkInDate = check_in_time ? new Date(check_in_time) : new Date();
  
  // Convert current check-in time to local YYYY-MM-DD representation
  const offset = checkInDate.getTimezoneOffset();
  const localDate = new Date(checkInDate.getTime() - (offset * 60 * 1000));
  const dateStr = date || localDate.toISOString().split('T')[0];
  const attendanceDate = new Date(dateStr);

  // Check if check-in already exists for this date
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      emp_id_attendance_date: {
        emp_id,
        attendance_date: attendanceDate,
      },
    },
  });

  if (existingAttendance) {
    throw new ApiError(400, "You have already checked in for today.");
  }

  try {
    const attendance = await prisma.attendance.create({
      data: {
        emp_id,
        attendance_date: attendanceDate,
        check_in: checkInDate,
        status: "present",
      },
    });
    return attendance;
  } catch (error) {
    throw new ApiError(500, "An error occurred while checking in.");
  }
}

export { checkInService };

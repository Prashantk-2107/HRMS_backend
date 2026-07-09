import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to handle employee check-out.
 * 
 * @param {string} emp_id - ID of the employee
 * @param {Object} data - Payload containing optional check_out_time and date
 * @returns {Promise<Object>} The updated attendance record
 */
async function checkOutService(emp_id, data) {
  const { date, check_out_time } = data;

  const checkOutDate = check_out_time ? new Date(check_out_time) : new Date();
  
  // Convert current check-out time to local YYYY-MM-DD representation
  const offset = checkOutDate.getTimezoneOffset();
  const localDate = new Date(checkOutDate.getTime() - (offset * 60 * 1000));
  const dateStr = date || localDate.toISOString().split('T')[0];
  const attendanceDate = new Date(dateStr);

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      emp_id_attendance_date: {
        emp_id,
        attendance_date: attendanceDate,
      },
    },
  });

  if (!existingAttendance) {
    throw new ApiError(400, "No check-in record found for today.");
  }

  if (existingAttendance.status === "absent") {
    throw new ApiError(
      400,
      "Your attendance for today is marked as absent. Please contact administration to approve/update it."
    );
  }

  if (existingAttendance.check_out) {
    throw new ApiError(400, "You have already checked out for today.");
  }

  // Calculate working hours
  const checkInTime = new Date(existingAttendance.check_in);
  const diffMs = checkOutDate - checkInTime;
  const diffHours = diffMs / (1000 * 60 * 60);
  const workingHours = Math.max(0, parseFloat(diffHours.toFixed(2)));

  // Determine status: if working hours < 8.0, mark as half_day, else present
  let status = "present";
  if (workingHours < 8.0) {
    status = "half_day";
  }

  try {
    const attendance = await prisma.attendance.update({
      where: {
        emp_id_attendance_date: {
          emp_id,
          attendance_date: attendanceDate,
        },
      },
      data: {
        check_out: checkOutDate,
        working_hours: workingHours,
        status,
      },
    });
    return attendance;
  } catch (error) {
    throw new ApiError(500, "An error occurred while checking out.");
  }
}

export { checkOutService };

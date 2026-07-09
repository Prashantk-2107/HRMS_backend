import prisma from "../../config/db.js";

/**
 * Service to fetch today's attendance record of an employee.
 * 
 * @param {string} emp_id - ID of the employee
 * @param {Object} data - Contains optional date
 * @returns {Promise<Object|null>} The attendance record if exists, otherwise null
 */
async function getTodayAttendanceService(emp_id, data = {}) {
  const { date } = data;
  
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const dateStr = date || localDate.toISOString().split('T')[0];
  const attendanceDate = new Date(dateStr);

  const attendance = await prisma.attendance.findUnique({
    where: {
      emp_id_attendance_date: {
        emp_id,
        attendance_date: attendanceDate,
      },
    },
  });

  return attendance || null;
}

export { getTodayAttendanceService };

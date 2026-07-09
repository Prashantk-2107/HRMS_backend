import prisma from "../../config/db.js";

/**
 * Service to fetch historical logs and statistics for an employee.
 * 
 * @param {string} emp_id - ID of the employee
 * @returns {Promise<Object>} Object containing attendance logs list and computed statistics
 */
async function getMyAttendanceSummaryService(emp_id) {
  // Fetch all attendance logs for the employee ordered by date descending
  const logs = await prisma.attendance.findMany({
    where: {
      emp_id,
    },
    orderBy: {
      attendance_date: "desc",
    },
  });

  // Calculate statistics
  const totalDays = logs.length;
  const presentDays = logs.filter(log => log.status === "present").length;
  const halfDays = logs.filter(log => log.status === "half_day").length;
  
  // Calculate average working hours for logs that have check_out completed
  const logsWithWorkingHours = logs.filter(log => log.working_hours !== null && log.working_hours !== undefined);
  const totalWorkingHours = logsWithWorkingHours.reduce((sum, log) => sum + Number(log.working_hours), 0);
  const avgWorkingHours = logsWithWorkingHours.length > 0 
    ? parseFloat((totalWorkingHours / logsWithWorkingHours.length).toFixed(1))
    : 0;

  // Calculate late check-ins: check-in after 09:30 AM local time
  const lateCheckIns = logs.filter(log => {
    if (!log.check_in) return false;
    const checkInTime = new Date(log.check_in);
    const hour = checkInTime.getHours();
    const minute = checkInTime.getMinutes();
    return hour > 9 || (hour === 9 && minute > 30);
  }).length;

  return {
    logs,
    statistics: {
      totalDays,
      presentDays,
      halfDays,
      avgWorkingHours,
      lateCheckIns,
    },
  };
}

export { getMyAttendanceSummaryService };

import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to fetch all attendance logs for a given month/year.
 * Used for HR exports.
 * 
 * @param {Object} queryParams - { year, month } (month is 1-based, 1 to 12)
 * @returns {Promise<Array>} List of attendance logs with employee details
 */
async function getMonthlyReportService({ year, month }) {
  if (!year || !month) {
    throw new ApiError(400, "Year and month query parameters are required.");
  }

  // Create starting and ending dates for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of the month

  // Fetch all logs in this range
  const logs = await prisma.attendance.findMany({
    where: {
      attendance_date: {
        gte: startDate,
        lte: endDate,
      },
      // Exclude admin logs
      employee: {
        role: {
          name: {
            notIn: ["Super_admin", "Admin"],
          },
        },
      },
    },
    include: {
      employee: {
        select: {
          empCode: true,
          first_name: true,
          last_name: true,
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      attendance_date: "desc",
    },
  });

  // Flatten output structure
  const formattedLogs = logs.map((log) => ({
    log_id: log.id,
    empCode: log.employee?.empCode,
    name: `${log.employee?.first_name || ''} ${log.employee?.last_name || ''}`.trim(),
    email: log.employee?.email,
    role: log.employee?.role?.name || "Employee",
    date: log.attendance_date.toISOString().split('T')[0],
    check_in: log.check_in,
    check_out: log.check_out,
    working_hours: log.working_hours ? Number(log.working_hours) : null,
    status: log.status,
  }));

  return formattedLogs;
}

export { getMonthlyReportService };

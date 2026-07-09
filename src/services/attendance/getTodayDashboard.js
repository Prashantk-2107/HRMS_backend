import prisma from "../../config/db.js";

/**
 * Service to aggregate today's team attendance stats and employee logs.
 * Restricted to non-admin roles for visibility checks.
 * 
 * @returns {Promise<Object>} Object containing summary statistics and list of today's logs
 */
async function getTodayDashboardService() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const dateStr = localDate.toISOString().split('T')[0];
  const attendanceDate = new Date(dateStr);

  // 1. Fetch all active employees (excluding super_admin and admin roles)
  const activeEmployees = await prisma.employee.findMany({
    where: {
      employee_status: "active",
    },
    select: {
      emp_id: true,
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
  });

  const targetEmployees = activeEmployees.filter((emp) => {
    const roleName = emp.role?.name?.toLowerCase().replace(/[\s_-]/g, "");
    return roleName !== "superadmin" && roleName !== "admin";
  });

  // 2. Fetch all attendance logs for today
  const todayLogs = await prisma.attendance.findMany({
    where: {
      attendance_date: attendanceDate,
    },
  });

  // Map today's logs by emp_id for quick lookups
  const logsMap = new Map();
  todayLogs.forEach((log) => {
    logsMap.set(log.emp_id, log);
  });

  // 3. Build detailed list and calculate metrics
  let checkedInCount = 0;
  let checkedOutCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  const logsList = targetEmployees.map((emp) => {
    const log = logsMap.get(emp.emp_id) || null;
    let status = "not_checked_in";
    let check_in = null;
    let check_out = null;
    let working_hours = null;

    if (log) {
      check_in = log.check_in;
      check_out = log.check_out;
      working_hours = log.working_hours;
      status = log.status;

      if (status === "absent") {
        absentCount++;
      } else if (check_out) {
        checkedOutCount++;
      } else {
        checkedInCount++;
      }

      // Check if late check-in (after 9:30 AM local time)
      if (check_in) {
        const checkInTime = new Date(check_in);
        const hour = checkInTime.getHours();
        const minute = checkInTime.getMinutes();
        if (hour > 9 || (hour === 9 && minute > 30)) {
          lateCount++;
        }
      }
    } else {
      // If no log exists for today yet
      absentCount++;
    }

    return {
      emp_id: emp.emp_id,
      empCode: emp.empCode,
      name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
      email: emp.email,
      role: emp.role?.name || "Employee",
      check_in,
      check_out,
      working_hours: working_hours ? Number(working_hours) : null,
      status,
    };
  });

  return {
    statistics: {
      totalEmployees: targetEmployees.length,
      checkedIn: checkedInCount,
      checkedOut: checkedOutCount,
      lateArrivals: lateCount,
      absent: absentCount,
    },
    logs: logsList,
  };
}

export { getTodayDashboardService };

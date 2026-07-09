import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to generate daily metrics, day-of-week average distributions, and calendar heatmaps.
 * 
 * @param {Object} params - { year, month } (month is 1-based, 1 to 12)
 * @returns {Promise<Object>} Compiled analytics data
 */
async function getAnalyticsService({ year, month }) {
  if (!year || !month) {
    throw new ApiError(400, "Year and month query parameters are required.");
  }

  // 1. Get total active employees (excluding admins)
  const activeEmployees = await prisma.employee.findMany({
    where: {
      employee_status: "active",
      role: {
        name: {
          notIn: ["Super_admin", "Admin"],
        },
      },
    },
    select: {
      emp_id: true,
    },
  });

  const employeeCount = activeEmployees.length || 1;

  // 2. Fetch all holidays and attendance logs in range
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  const daysInMonth = new Date(year, month, 0).getDate();

  const logs = await prisma.attendance.findMany({
    where: {
      attendance_date: {
        gte: startDate,
        lte: endDate,
      },
      employee: {
        role: {
          name: {
            notIn: ["Super_admin", "Admin"],
          },
        },
      },
    },
  });

  const holidays = await prisma.holidays.findMany({
    where: {
      holiday_date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Map logs by date string
  const logsByDate = {};
  logs.forEach((log) => {
    const dStr = log.attendance_date.toISOString().split("T")[0];
    if (!logsByDate[dStr]) logsByDate[dStr] = [];
    logsByDate[dStr].push(log);
  });

  // Map holidays by date string
  const holidayDates = new Set(
    holidays.map((h) => h.holiday_date.toISOString().split("T")[0])
  );

  const dailyRates = [];
  const weekdayTotals = {
    1: { sum: 0, count: 0, label: "Mon" },
    2: { sum: 0, count: 0, label: "Tue" },
    3: { sum: 0, count: 0, label: "Wed" },
    4: { sum: 0, count: 0, label: "Thu" },
    5: { sum: 0, count: 0, label: "Fri" },
  };

  // 3. Compile daily logs and rates
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = currentDate.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayDates.has(dateStr);

    const dayLogs = logsByDate[dateStr] || [];
    const presentLogs = dayLogs.filter(
      (l) => l.status === "present" || l.status === "half_day"
    );

    let rate = 0;
    let status = "workday";

    if (isWeekend) {
      status = "weekend";
    } else if (isHoliday) {
      status = "holiday";
    } else {
      // It is a workday
      rate = Math.round((presentLogs.length / employeeCount) * 100);
      
      // Update weekday distribution averages
      if (weekdayTotals[dayOfWeek]) {
        weekdayTotals[dayOfWeek].sum += rate;
        weekdayTotals[dayOfWeek].count += 1;
      }
    }

    // Determine heatmap color
    let color = "gray"; // default weekend/holiday
    if (status === "workday") {
      if (rate >= 90) color = "green";
      else if (rate >= 70) color = "yellow";
      else color = "red";
    }

    dailyRates.push({
      date: dateStr,
      day,
      rate,
      present: presentLogs.length,
      absent: employeeCount - presentLogs.length,
      status,
      color,
    });
  }

  // 4. Compile day-of-week averages
  const weekdayAverages = Object.keys(weekdayTotals).map((key) => {
    const { sum, count, label } = weekdayTotals[key];
    const avg = count > 0 ? Math.round(sum / count) : 0;
    return {
      name: label,
      rate: avg,
    };
  });

  return {
    dailyRates,
    weekdayAverages,
    employeeCount,
  };
}

export { getAnalyticsService };

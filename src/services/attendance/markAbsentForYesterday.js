import prisma from "../../config/db.js";

/**
 * Service to mark all active employees absent for yesterday if they missed
 * check-in or forgot to check-out.
 */
async function markAbsentForYesterdayService() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  
  // Yesterday's date string (e.g. "2026-07-08")
  const yesterday = new Date(localDate.getTime() - (24 * 60 * 60 * 1000));
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const attendanceDate = new Date(yesterdayStr);

  console.log(`[Absent Job] Checking attendance for date: ${yesterdayStr}`);

  // Check if yesterday was a weekend
  const dayOfWeek = attendanceDate.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Check if yesterday was a public holiday
  const holiday = await prisma.holiday.findFirst({
    where: {
      holiday_date: attendanceDate,
    },
  });

  if (isWeekend || holiday) {
    console.log(`[Absent Job] Skipping check for ${yesterdayStr} because it was a ${isWeekend ? 'weekend' : 'public holiday'}.`);
    return;
  }

  // Get all active employees, excluding roles like 'superadmin' and 'admin'
  const activeEmployees = await prisma.employee.findMany({
    where: {
      employee_status: "active",
    },
    select: {
      emp_id: true,
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

  for (const emp of targetEmployees) {
    const emp_id = emp.emp_id;

    // Check if there is an attendance record for yesterday
    const existing = await prisma.attendance.findUnique({
      where: {
        emp_id_attendance_date: {
          emp_id,
          attendance_date: attendanceDate,
        },
      },
    });

    if (!existing) {
      // Case 1: No check-in: mark as absent
      await prisma.attendance.create({
        data: {
          emp_id,
          attendance_date: attendanceDate,
          status: "absent",
        },
      });
      console.log(`[Absent Job] Marked employee ${emp_id} as ABSENT (no check-in)`);
    } else if (existing.check_in && !existing.check_out) {
      // Case 2: Checked-in but did not check out: update status to absent
      await prisma.attendance.update({
        where: {
          emp_id_attendance_date: {
            emp_id,
            attendance_date: attendanceDate,
          },
        },
        data: {
          status: "absent",
        },
      });
      console.log(`[Absent Job] Marked employee ${emp_id} as ABSENT (forgot to check-out)`);
    }
  }
}

export { markAbsentForYesterdayService };

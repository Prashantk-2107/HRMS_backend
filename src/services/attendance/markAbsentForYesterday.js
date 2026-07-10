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

  const targetEmpIds = targetEmployees.map((emp) => emp.emp_id);

  if (targetEmpIds.length === 0) {
    return;
  }

  // 1. Fetch all existing attendance records for target employees on yesterday's date in a single query
  const existingAttendances = await prisma.attendance.findMany({
    where: {
      emp_id: { in: targetEmpIds },
      attendance_date: attendanceDate,
    },
    select: {
      emp_id: true,
      check_in: true,
      check_out: true,
      status: true,
    },
  });

  const attendanceMap = new Map(existingAttendances.map((a) => [a.emp_id, a]));

  // 2. Fetch all approved leave requests covering yesterday's date in a single query
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      emp_id: { in: targetEmpIds },
      status: "approved",
      start_date: { lte: attendanceDate },
      end_date: { gte: attendanceDate },
    },
    select: {
      emp_id: true,
    },
  });

  const leaveSet = new Set(approvedLeaves.map((l) => l.emp_id));

  const toCreate = [];
  const toUpdate = [];

  for (const emp of targetEmployees) {
    const emp_id = emp.emp_id;
    const existing = attendanceMap.get(emp_id);
    const hasApprovedLeave = leaveSet.has(emp_id);
    const finalStatus = hasApprovedLeave ? "leave" : "absent";

    if (!existing) {
      toCreate.push({
        emp_id,
        attendance_date: attendanceDate,
        status: finalStatus,
      });
    } else if (existing.check_in && !existing.check_out) {
      if (existing.status !== finalStatus) {
        toUpdate.push({
          emp_id,
          status: finalStatus,
        });
      }
    }
  }

  // 3. Bulk insert new attendance records
  if (toCreate.length > 0) {
    await prisma.attendance.createMany({
      data: toCreate,
    });
    console.log(`[Absent Job] Bulk created ${toCreate.length} absent/leave records.`);
  }

  // 4. Bulk update records where employees checked in but forgot to check out
  const toMarkAbsentIds = toUpdate.filter((u) => u.status === "absent").map((u) => u.emp_id);
  const toMarkLeaveIds = toUpdate.filter((u) => u.status === "leave").map((u) => u.emp_id);

  if (toMarkAbsentIds.length > 0) {
    await prisma.attendance.updateMany({
      where: {
        attendance_date: attendanceDate,
        emp_id: { in: toMarkAbsentIds },
      },
      data: {
        status: "absent",
      },
    });
    console.log(`[Absent Job] Bulk updated ${toMarkAbsentIds.length} records to ABSENT (forgot check-out).`);
  }

  if (toMarkLeaveIds.length > 0) {
    await prisma.attendance.updateMany({
      where: {
        attendance_date: attendanceDate,
        emp_id: { in: toMarkLeaveIds },
      },
      data: {
        status: "leave",
      },
    });
    console.log(`[Absent Job] Bulk updated ${toMarkLeaveIds.length} records to LEAVE (forgot check-out).`);
  }
}

export { markAbsentForYesterdayService };

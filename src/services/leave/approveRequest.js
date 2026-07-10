import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to approve a leave request.
 * Automatically synchronizes any overlapping past/current dates with the Attendance logs.
 */
async function approveLeaveRequestService(id) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new ApiError(404, "Leave request not found.");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, `Cannot approve a leave request that is already ${request.status}.`);
  }

  // 1. Transaction to approve request and update status
  const approvedRequest = await prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id },
      data: { status: "approved" },
    });

    // 2. Overwrite attendance logs for any leave dates that fall in the past or today
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    const todayStr = localDate.toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    const start = new Date(request.start_date);
    const end = new Date(request.end_date);

    const attendanceUpserts = [];

    // Loop through each date in the leave request range
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dStr = d.toISOString().split('T')[0];
      const targetDate = new Date(dStr);

      // Apply to past dates or today
      if (targetDate <= todayDate) {
        attendanceUpserts.push(
          tx.attendance.upsert({
            where: {
              emp_id_attendance_date: {
                emp_id: request.emp_id,
                attendance_date: targetDate,
              },
            },
            update: {
              status: "leave",
              check_in: null,
              check_out: null,
              working_hours: null,
            },
            create: {
              emp_id: request.emp_id,
              attendance_date: targetDate,
              status: "leave",
              check_in: null,
              check_out: null,
              working_hours: null,
            },
          })
        );
      }
    }

    if (attendanceUpserts.length > 0) {
      // Execute upserts inside the transactional database context
      await Promise.all(attendanceUpserts);
    }

    return updated;
  });

  return approvedRequest;
}

export { approveLeaveRequestService };

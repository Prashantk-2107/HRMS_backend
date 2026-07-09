import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to submit a leave request for an employee.
 * Ensures the date range does not overlap with any pending/approved leaves.
 */
async function createLeaveRequestService({ emp_id, start_date, end_date, leave_type, reason }) {
  const reqStart = new Date(start_date);
  const reqEnd = new Date(end_date);

  // Normalize dates to midnight to ignore time variations
  reqStart.setHours(0, 0, 0, 0);
  reqEnd.setHours(23, 59, 59, 999);

  // 1. Check for overlapping approved or pending leave requests
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      emp_id,
      status: { in: ["pending", "approved"] },
      start_date: { lte: reqEnd },
      end_date: { gte: reqStart },
    },
  });

  if (overlap) {
    throw new ApiError(
      400,
      `You already have a leave request (${overlap.status}) overlapping this date range.`
    );
  }

  // 2. Create the leave request
  const request = await prisma.leaveRequest.create({
    data: {
      emp_id,
      start_date: reqStart,
      end_date: reqEnd,
      leave_type,
      reason,
    },
  });

  return request;
}

export { createLeaveRequestService };

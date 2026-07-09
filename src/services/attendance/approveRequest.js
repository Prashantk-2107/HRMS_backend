import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to approve a regularization request and update the attendance record.
 * 
 * @param {string} request_id - ID of the regularization request
 * @returns {Promise<Object>} The updated regularization request
 */
async function approveRequestService(request_id) {
  const request = await prisma.attendanceRegularization.findUnique({
    where: { id: request_id },
    include: { attendance: true },
  });

  if (!request) {
    throw new ApiError(404, "Regularization request not found.");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, `Request has already been processed (current status: ${request.status}).`);
  }

  const { attendance } = request;
  
  // Use requested times, fallback to existing attendance times
  const finalCheckIn = request.check_in || attendance.check_in;
  const finalCheckOut = request.check_out || attendance.check_out;

  let workingHours = null;
  let status = attendance.status;

  if (finalCheckIn && finalCheckOut) {
    const checkInTime = new Date(finalCheckIn);
    const checkOutTime = new Date(finalCheckOut);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    workingHours = Math.max(0, parseFloat(diffHours.toFixed(2)));

    // Recompute status based on hours
    status = workingHours >= 8.0 ? "present" : "half_day";
  } else if (finalCheckIn) {
    // If only checked in, mark as present (waiting for check-out)
    status = "present";
  }

  try {
    // Use transaction to update both records atomically
    const [updatedRequest, updatedAttendance] = await prisma.$transaction([
      prisma.attendanceRegularization.update({
        where: { id: request_id },
        data: { status: "approved" },
      }),
      prisma.attendance.update({
        where: { id: request.attendance_id },
        data: {
          check_in: finalCheckIn,
          check_out: finalCheckOut,
          working_hours: workingHours,
          status,
        },
      }),
    ]);

    return updatedRequest;
  } catch (error) {
    throw new ApiError(500, "An error occurred while approving regularization request.");
  }
}

export { approveRequestService };

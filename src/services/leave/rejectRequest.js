import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to reject a leave request with a specified reason.
 */
async function rejectLeaveRequestService({ id, rejection_reason }) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new ApiError(404, "Leave request not found.");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, `Cannot reject a leave request that is already ${request.status}.`);
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: "rejected",
      rejection_reason,
    },
  });

  return updated;
}

export { rejectLeaveRequestService };

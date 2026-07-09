import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to reject a regularization request.
 * 
 * @param {string} request_id - ID of the request
 * @param {string} rejection_reason - Explanatory note for rejection
 * @returns {Promise<Object>} The updated regularization request
 */
async function rejectRequestService(request_id, rejection_reason) {
  const request = await prisma.attendanceRegularization.findUnique({
    where: { id: request_id },
  });

  if (!request) {
    throw new ApiError(404, "Regularization request not found.");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, `Request has already been processed (current status: ${request.status}).`);
  }

  try {
    const updatedRequest = await prisma.attendanceRegularization.update({
      where: { id: request_id },
      data: {
        status: "rejected",
        rejection_reason,
      },
    });

    return updatedRequest;
  } catch (error) {
    throw new ApiError(500, "An error occurred while rejecting regularization request.");
  }
}

export { rejectRequestService };

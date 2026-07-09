import prisma from "../../config/db.js";

/**
 * Service to fetch all pending regularization requests for approval.
 * 
 * @returns {Promise<Array>} List of pending requests with employee details
 */
async function getPendingRequestsService() {
  const requests = await prisma.attendanceRegularization.findMany({
    where: {
      status: "pending",
    },
    orderBy: {
      created_at: "asc",
    },
    include: {
      employee: {
        select: {
          first_name: true,
          last_name: true,
          empCode: true,
          email: true,
        },
      },
      attendance: true,
    },
  });

  return requests;
}

export { getPendingRequestsService };

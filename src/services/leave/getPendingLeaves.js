import prisma from "../../config/db.js";

/**
 * Service to fetch all pending leave requests across all employees.
 */
async function getPendingLeavesService() {
  const requests = await prisma.leaveRequest.findMany({
    where: {
      status: "pending",
    },
    include: {
      employee: {
        select: {
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
      },
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return requests;
}

export { getPendingLeavesService };

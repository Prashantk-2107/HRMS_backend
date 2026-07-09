import prisma from "../../config/db.js";

/**
 * Service to fetch leave logs for the logged-in employee.
 */
async function getMyLeavesService(emp_id) {
  const requests = await prisma.leaveRequest.findMany({
    where: {
      emp_id,
    },
    orderBy: {
      start_date: "desc",
    },
  });

  return requests;
}

export { getMyLeavesService };

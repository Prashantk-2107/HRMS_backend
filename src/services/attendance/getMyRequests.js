import prisma from "../../config/db.js";

/**
 * Service to fetch all regularization requests submitted by a specific employee.
 * 
 * @param {string} emp_id - ID of the employee
 * @returns {Promise<Array>} List of regularization requests
 */
async function getMyRequestsService(emp_id) {
  const requests = await prisma.attendanceRegularization.findMany({
    where: {
      emp_id,
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      attendance: true,
    },
  });

  return requests;
}

export { getMyRequestsService };

import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to get bank details for a specific employee.
 * 
 * @param {string} emp_id - The ID of the employee
 * @returns {Promise<Array>} List of bank details records
 */
async function getBankDetailsService(emp_id) {
  // 1. Check if employee exists
  const employeeExists = await prisma.employee.findUnique({
    where: { emp_id },
  });

  if (!employeeExists) {
    throw new ApiError(404, "Employee not found with the provided ID.");
  }

  // 2. Fetch bank details
  const bankDetailsList = await prisma.employeeBankDetails.findMany({
    where: { emp_id },
    orderBy: { created_at: "desc" },
  });

  return bankDetailsList;
}

export { getBankDetailsService };

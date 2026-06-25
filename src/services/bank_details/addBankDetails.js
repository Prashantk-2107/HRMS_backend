import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to add bank details for an employee.
 * 
 * @param {Object} bankDetailsData - The bank details data payload
 * @returns {Promise<Object>} Created bank details record
 */
async function addBankDetailsService(bankDetailsData) {
  const {
    emp_id,
    bank_name,
    account_number,
    ifsc_code,
    branch_address,
    account_type,
  } = bankDetailsData;

  // 1. Check if employee exists
  const employeeExists = await prisma.employee.findUnique({
    where: { emp_id },
  });

  if (!employeeExists) {
    throw new ApiError(404, "Employee not found with the provided ID.");
  }

  // 2. Check if this specific account number is already registered for this employee
  const existingBankDetails = await prisma.employeeBankDetails.findFirst({
    where: {
      emp_id,
      account_number,
    },
  });

  if (existingBankDetails) {
    throw new ApiError(
      400,
      "This bank account number is already registered for this employee."
    );
  }

  try {
    // 3. Create the bank details record
    const createdBankDetails = await prisma.employeeBankDetails.create({
      data: {
        emp_id,
        bank_name,
        account_number,
        ifsc_code,
        branch_address,
        account_type,
      },
    });

    return createdBankDetails;
  } catch (error) {
    throw new ApiError(
      500,
      "An internal server error occurred while adding the bank details."
    );
  }
}

export { addBankDetailsService };

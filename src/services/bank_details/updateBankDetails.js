import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to update existing bank details of an employee.
 * 
 * @param {string} emp_bank_id - The ID of the bank details record to update
 * @param {Object} updateData - Object containing the fields to update
 * @returns {Promise<Object>} Updated bank details record
 */
async function updateBankDetailsService(emp_bank_id, updateData) {
  // 1. Verify if the bank details record exists
  const existingRecord = await prisma.employeeBankDetails.findUnique({
    where: { emp_bank_id },
  });

  if (!existingRecord) {
    throw new ApiError(404, "Bank details record not found.");
  }

  // 2. If account number is being changed, check if the employee already has this account number on another record
  const { account_number } = updateData;
  if (account_number && account_number !== existingRecord.account_number) {
    const duplicateAccount = await prisma.employeeBankDetails.findFirst({
      where: {
        emp_id: existingRecord.emp_id,
        account_number: account_number,
      },
    });

    if (duplicateAccount) {
      throw new ApiError(
        400,
        "This bank account number is already registered for this employee."
      );
    }
  }

  try {
    // 3. Update the record
    const updatedRecord = await prisma.employeeBankDetails.update({
      where: { emp_bank_id },
      data: updateData,
    });

    return updatedRecord;
  } catch (error) {
    throw new ApiError(
      500,
      "An internal server error occurred while updating the bank details."
    );
  }
}

export { updateBankDetailsService };

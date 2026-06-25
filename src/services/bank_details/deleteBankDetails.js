import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to delete a specific bank details record.
 * 
 * @param {string} emp_bank_id - The ID of the bank details record
 * @returns {Promise<Object>} The deleted bank details record
 */
async function deleteBankDetailsService(emp_bank_id) {
  // 1. Verify if the bank details record exists
  const existingRecord = await prisma.employeeBankDetails.findUnique({
    where: { emp_bank_id },
  });

  if (!existingRecord) {
    throw new ApiError(404, "Bank details record not found.");
  }

  try {
    // 2. Delete the record
    const deletedRecord = await prisma.employeeBankDetails.delete({
      where: { emp_bank_id },
    });

    return deletedRecord;
  } catch (error) {
    throw new ApiError(
      500,
      "An internal server error occurred while deleting the bank details."
    );
  }
}

export { deleteBankDetailsService };

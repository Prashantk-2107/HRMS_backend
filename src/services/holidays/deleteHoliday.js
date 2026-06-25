import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to delete a specific holiday record.
 * 
 * @param {string} holiday_id - The ID of the holiday record
 * @returns {Promise<Object>} The deleted holiday record
 */
async function deleteHolidayService(holiday_id) {
  // 1. Verify if the holiday record exists
  const existingRecord = await prisma.holiday.findUnique({
    where: { holiday_id },
  });

  if (!existingRecord) {
    throw new ApiError(404, "Holiday record not found.");
  }

  try {
    // 2. Delete the record
    const deletedRecord = await prisma.holiday.delete({
      where: { holiday_id },
    });

    return deletedRecord;
  } catch (error) {
    throw new ApiError(
      500,
      "An internal server error occurred while deleting the holiday."
    );
  }
}

export { deleteHolidayService };

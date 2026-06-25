import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to update an existing holiday.
 * 
 * @param {string} holiday_id - The ID of the holiday record to update
 * @param {Object} updateData - Object containing the fields to update
 * @returns {Promise<Object>} Updated holiday record
 */
async function updateHolidayService(holiday_id, updateData) {
  // 1. Verify if the holiday record exists
  const existingHoliday = await prisma.holiday.findUnique({
    where: { holiday_id },
  });

  if (!existingHoliday) {
    throw new ApiError(404, "Holiday not found.");
  }

  // 2. If the holiday date is changing, verify it doesn't conflict with another holiday
  const { holiday_date } = updateData;
  let parsedDate = undefined;

  if (holiday_date) {
    parsedDate = new Date(holiday_date);

    const conflictingHoliday = await prisma.holiday.findFirst({
      where: {
        holiday_date: parsedDate,
        NOT: {
          holiday_id: holiday_id,
        },
      },
    });

    if (conflictingHoliday) {
      throw new ApiError(
        400,
        "A holiday is already registered on this date."
      );
    }
  }

  try {
    // 3. Update the record
    const updatedHoliday = await prisma.holiday.update({
      where: { holiday_id },
      data: {
        ...updateData,
        ...(parsedDate && { holiday_date: parsedDate }),
      },
    });

    return updatedHoliday;
  } catch (error) {
    throw new ApiError(
      500,
      "An internal server error occurred while updating the holiday."
    );
  }
}

export { updateHolidayService };

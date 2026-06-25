import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to create a new holiday.
 * 
 * @param {Object} holidayData - The holiday data payload
 * @returns {Promise<Object>} The created holiday record
 */
async function createHolidayService(holidayData) {
  const { holiday_date, holiday_name, holiday_type } = holidayData;

  const parsedDate = new Date(holiday_date);

  // 1. Check if a holiday already exists on this date
  const existingHoliday = await prisma.holiday.findFirst({
    where: {
      holiday_date: parsedDate,
    },
  });

  if (existingHoliday) {
    throw new ApiError(400, "A holiday is already registered on this date.");
  }

  try {
    // 2. Create the holiday record
    const newHoliday = await prisma.holiday.create({
      data: {
        holiday_date: parsedDate,
        holiday_name,
        holiday_type,
      },
    });

    return newHoliday;
  } catch (error) {
    throw new ApiError(
      500,
      "An internal server error occurred while creating the holiday."
    );
  }
}

export { createHolidayService };

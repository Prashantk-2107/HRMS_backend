import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to mark all weekends (Saturdays and Sundays) of a given month as company holidays.
 * 
 * @param {Object} data - { year, month } (month is 1-based, 1 to 12)
 * @returns {Promise<Array>} The newly created weekend holidays
 */
async function markWeekendsService({ year, month }) {
  const jsMonth = month - 1; // 0-based for JS Date
  const daysInMonth = new Date(year, month, 0).getDate();
  const createdHolidays = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const tempDate = new Date(year, jsMonth, d);
    const dayOfWeek = tempDate.getDay(); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const parsedDate = new Date(dateStr);

      // Check if a holiday already exists on this date
      const existingHoliday = await prisma.holiday.findFirst({
        where: {
          holiday_date: parsedDate,
        },
      });

      if (!existingHoliday) {
        const holidayName = dayOfWeek === 6 ? "Saturday" : "Sunday";
        const newHoliday = await prisma.holiday.create({
          data: {
            holiday_date: parsedDate,
            holiday_name: holidayName,
            holiday_type: "company",
          },
        });
        createdHolidays.push(newHoliday);
      }
    }
  }

  return createdHolidays;
}

export { markWeekendsService };

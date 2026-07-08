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
  const weekendDates = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const tempDate = new Date(year, jsMonth, d);
    const dayOfWeek = tempDate.getDay(); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const parsedDate = new Date(dateStr);
      weekendDates.push({
        parsedDate,
        holidayName: dayOfWeek === 6 ? "Saturday" : "Sunday",
      });
    }
  }

  if (weekendDates.length === 0) {
    return [];
  }

  // 1. Fetch any holidays already existing on these weekend dates in a single query
  const existingHolidays = await prisma.holiday.findMany({
    where: {
      holiday_date: {
        in: weekendDates.map((w) => w.parsedDate),
      },
    },
  });

  const existingDatesSet = new Set(
    existingHolidays.map((h) => h.holiday_date.toISOString())
  );

  // 2. Filter weekends that do not exist yet
  const weekendsToCreate = weekendDates
    .filter((w) => !existingDatesSet.has(w.parsedDate.toISOString()))
    .map((w) => ({
      holiday_date: w.parsedDate,
      holiday_name: w.holidayName,
      holiday_type: "company",
    }));

  if (weekendsToCreate.length === 0) {
    return [];
  }

  // 3. Create all missing weekend holidays in a single bulk insert
  await prisma.holiday.createMany({
    data: weekendsToCreate,
  });

  // 4. Retrieve the newly created holidays to return them in full
  const newlyCreatedHolidays = await prisma.holiday.findMany({
    where: {
      holiday_date: {
        in: weekendsToCreate.map((w) => w.holiday_date),
      },
    },
  });

  return newlyCreatedHolidays;
}

export { markWeekendsService };

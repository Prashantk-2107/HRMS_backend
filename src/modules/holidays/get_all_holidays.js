import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";

/**
 * Controller to fetch all holidays in the system.
 * Accessible by any authenticated employee.
 */
const getAllHolidays = asyncHandler(async (req, res) => {
  const holidays = await prisma.holiday.findMany({
    orderBy: {
      holiday_date: "asc",
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Holidays retrieved successfully", {
      holidays,
    })
  );
});

export { getAllHolidays };

import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";
import { Pagination } from "../../utils/Pagination.js";

/**
 * Controller to fetch all holidays in the system.
 * Accessible by any authenticated employee.
 * Supports optional query params `page` and `limit` for pagination.
 */
const getAllHolidays = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  if (page !== undefined || limit !== undefined) {
    const pagination = new Pagination(page, limit);
    const { data: holidays, pagination: meta } = await pagination.paginate(
      prisma.holiday,
      {
        orderBy: {
          holiday_date: "asc",
        },
      }
    );

    return res.status(200).json(
      new ApiResponse(200, "Holidays retrieved successfully", {
        holidays,
        pagination: meta,
      })
    );
  }

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

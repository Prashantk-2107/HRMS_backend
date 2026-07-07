import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { markWeekendsService } from "../../services/holidays/markWeekends.js";
import { markWeekendsSchema } from "../../validations/holiday.validation.js";

/**
 * Controller to handle marking all weekends in a month.
 */
const markWeekends = asyncHandler(async (req, res) => {
  const validation = markWeekendsSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const newHolidays = await markWeekendsService(validation.data);

  return res.status(201).json(
    new ApiResponse(201, "Weekends marked successfully", {
      holidays: newHolidays,
    })
  );
});

export { markWeekends };

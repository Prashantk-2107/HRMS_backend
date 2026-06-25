import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createHolidayService } from "../../services/holidays/createHoliday.js";
import { createHolidaySchema } from "../../validations/holiday.validation.js";

/**
 * Controller to handle creating a new holiday.
 */
const createHoliday = asyncHandler(async (req, res) => {
  const validation = createHolidaySchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const newHoliday = await createHolidayService(validation.data);

  return res.status(201).json(
    new ApiResponse(201, "Holiday created successfully", {
      holiday: newHoliday,
    })
  );
});

export { createHoliday };

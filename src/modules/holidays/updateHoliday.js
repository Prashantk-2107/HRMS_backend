import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { updateHolidayService } from "../../services/holidays/updateHoliday.js";
import { updateHolidaySchema } from "../../validations/holiday.validation.js";

/**
 * Controller to handle updating an existing holiday.
 */
const updateHoliday = asyncHandler(async (req, res) => {
  const { holiday_id } = req.params;

  if (!holiday_id) {
    throw new ApiError(400, "Holiday ID parameter (holiday_id) is required.");
  }

  const validation = updateHolidaySchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  if (Object.keys(validation.data).length === 0) {
    throw new ApiError(400, "Please provide at least one field to update.");
  }

  const updatedHoliday = await updateHolidayService(holiday_id, validation.data);

  return res.status(200).json(
    new ApiResponse(200, "Holiday updated successfully", {
      holiday: updatedHoliday,
    })
  );
});

export { updateHoliday };

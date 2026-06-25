import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { deleteHolidayService } from "../../services/holidays/deleteHoliday.js";

/**
 * Controller to handle deleting an existing holiday.
 */
const deleteHoliday = asyncHandler(async (req, res) => {
  const { holiday_id } = req.params;

  if (!holiday_id) {
    throw new ApiError(400, "Holiday ID parameter (holiday_id) is required.");
  }

  // Basic validation of uuid format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(holiday_id)) {
    throw new ApiError(400, "Invalid Holiday ID format (must be a valid UUID).");
  }

  const deletedRecord = await deleteHolidayService(holiday_id);

  return res.status(200).json(
    new ApiResponse(200, "Holiday deleted successfully", {
      holiday: deletedRecord,
    })
  );
});

export { deleteHoliday };

import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getAnalyticsService } from "../../services/attendance/getAnalytics.js";

/**
 * Controller to fetch monthly attendance rate trends, weekday stats, and heatmap colors.
 * Restricted to HR/Admin/Managers.
 */
const getAnalytics = asyncHandler(async (req, res) => {

  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  if (isNaN(year) || isNaN(month)) {
    throw new ApiError(400, "Valid year and month query parameters are required.");
  }

  const analyticsData = await getAnalyticsService({ year, month });

  return res.status(200).json(
    new ApiResponse(200, "Fetched attendance analytics successfully", {
      analytics: analyticsData,
    })
  );
});

export { getAnalytics };

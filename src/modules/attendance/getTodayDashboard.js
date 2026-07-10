import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getTodayDashboardService } from "../../services/attendance/getTodayDashboard.js";

/**
 * Controller to fetch today's team attendance statistics and logs list.
 * Restricted to HR/Admin.
 */
const getTodayDashboard = asyncHandler(async (req, res) => {
  const dashboardData = await getTodayDashboardService();

  return res.status(200).json(
    new ApiResponse(200, "Fetched today's team dashboard successfully", {
      dashboard: dashboardData,
    })
  );
});

export { getTodayDashboard };

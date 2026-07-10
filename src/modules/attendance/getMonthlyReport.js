import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getMonthlyReportService } from "../../services/attendance/getMonthlyReport.js";

/**
 * Controller to retrieve monthly attendance logs of all employees for exports.
 * Restricted to HR/Admin.
 */
const getMonthlyReport = asyncHandler(async (req, res) => {

  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  if (isNaN(year) || isNaN(month)) {
    throw new ApiError(400, "Valid year and month query parameters are required.");
  }

  const reportData = await getMonthlyReportService({ year, month });

  return res.status(200).json(
    new ApiResponse(200, "Fetched monthly report data successfully", {
      report: reportData,
    })
  );
});

export { getMonthlyReport };

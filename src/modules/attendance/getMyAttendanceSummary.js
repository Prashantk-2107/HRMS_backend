import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getMyAttendanceSummaryService } from "../../services/attendance/getMyAttendanceSummary.js";

/**
 * Controller to fetch the employee's historical logs and stats summary.
 */
const getMyAttendanceSummary = asyncHandler(async (req, res) => {
  const emp_id = req.employee.emp_id;
  const summary = await getMyAttendanceSummaryService(emp_id);

  return res.status(200).json(
    new ApiResponse(200, "Fetched attendance summary successfully", {
      summary,
    })
  );
});

export { getMyAttendanceSummary };

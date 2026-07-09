import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getTodayAttendanceService } from "../../services/attendance/getTodayAttendance.js";

/**
 * Controller to fetch today's attendance details for the employee.
 */
const getTodayAttendance = asyncHandler(async (req, res) => {
  const emp_id = req.employee.emp_id;
  const date = req.query.date;
  const attendance = await getTodayAttendanceService(emp_id, { date });

  return res.status(200).json(
    new ApiResponse(200, "Fetched today's attendance successfully", {
      attendance,
    })
  );
});

export { getTodayAttendance };

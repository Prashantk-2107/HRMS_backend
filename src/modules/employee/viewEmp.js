import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getEmployeeByIdService } from "../../services/employee/getEmployee.js";

/**
 * Controller to fetch an employee's details by their ID.
 * Accessible only by roles with the 'emp:view_any' permission (Super_admin, HR, Project_manager).
 */
const viewEmp = asyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(emp_id)) {
    throw new ApiError(400, "Invalid employee ID format");
  }

  // Fetch from service
  const employee = await getEmployeeByIdService(emp_id);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Employee details retrieved successfully", {
      employee,
    }),
  );
});

export { viewEmp };

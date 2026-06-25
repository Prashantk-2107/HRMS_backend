import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getAllEmployeesService } from "../../services/employee/getEmployee.js";
import { ApiError } from "../../utils/ApiError.js";

const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await getAllEmployeesService(req.employee.emp_id);

  if (!employees) {
    throw new ApiError(404, "No employees found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "All employees fetched successfully", { employees }),
    );
});

export { getAllEmployees };

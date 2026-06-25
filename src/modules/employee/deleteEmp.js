import asyncHandler from "../../utils/asyncHandler.js";
import { deleteEmployeeService } from "../../services/employee/deleteEmployee.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const deleteEmp = asyncHandler(async (req, res) => {
  //validation

  const emp_id = req.params.emp_id;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(emp_id)) {
    throw new ApiError(400, "Invalid employee ID format");
  }

  if (req.employee.emp_id === emp_id) {
    throw new ApiError(403, "You cannot delete your own account");
  }

  const deletedUser = await deleteEmployeeService(emp_id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee deleted successfully", deletedUser));
});

export { deleteEmp };

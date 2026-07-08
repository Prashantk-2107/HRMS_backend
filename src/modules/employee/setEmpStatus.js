import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { updateEmployee } from "../../services/employee/updateEmployee.js";
import { setEmployeeStatusSchema } from "../../validations/employee.validation.js";
import prisma from "../../config/db.js";

const setEmployeeStatus = asyncHandler(async (req, res) => {
  const validation = setEmployeeStatusSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const { emp_id, status } = validation.data;

  // Self deactivation guard
  const currentEmpId = req.employee?.emp_id;
  if (currentEmpId === emp_id) {
    throw new ApiError(400, "Forbidden: You cannot change your own status.");
  }

  // Check if target employee exists
  const targetEmployee = await prisma.employee.findUnique({
    where: { emp_id },
  });

  if (!targetEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  // Use the updateEmployee service to update employee_status column in the database
  const employee = await updateEmployee(emp_id, { employee_status: status });

  // Sanitize the returned employee details
  const sanitizedEmployee = { ...employee };
  delete sanitizedEmployee.password;

  return res.status(200).json(
    new ApiResponse(200, "Employee status updated successfully", {
      employee: sanitizedEmployee,
    }),
  );
});

export { setEmployeeStatus };

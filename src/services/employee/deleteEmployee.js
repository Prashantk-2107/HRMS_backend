import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

async function deleteEmployeeService(emp_id) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { emp_id },
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    const deletedEmployee = await prisma.employee.delete({
      where: { emp_id },
    });



    const sanitizedEmployee = { ...deletedEmployee };
    delete sanitizedEmployee.password;

    return sanitizedEmployee;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      "Internal Server Error occurred while deleting the employee.",
    );
  }
}

export { deleteEmployeeService };

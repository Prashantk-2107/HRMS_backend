import prisma from "../../config/db.js";

async function updateEmployee(emp_id, data) {
  try {
    const updatedEmployee = await prisma.employee.update({
      where: { emp_id },
      data,
    });
    return updatedEmployee;
  } catch (error) {
    throw error;
  }
}

export { updateEmployee };

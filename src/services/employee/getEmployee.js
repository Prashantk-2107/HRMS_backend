import prisma from "../../config/db.js";

async function getEmployeeByEmail(email) {
  try {
    const lowerCaseEmail = email ? email.toLowerCase() : "";
    const employee = await prisma.employee.findUnique({
      where: { email: lowerCaseEmail },

      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    return employee;
  } catch (error) {
    throw error;
  }
}

async function getAllEmployeesService(empId) {
  const employees = await prisma.employee.findMany({
    select: {
      emp_id: true,
      first_name: true,
      last_name: true,
      empCode: true,
      phone_number: true,
      email: true,
      is_email_verified: true,
      created_at: true,
      updated_at: true,
      employee_status: true,
      employment_type: true,
      role: {
        select: {
          name: true,
        },
      },
    },
    where: {
      emp_id: { not: empId },
    },
  });
  return employees;
}

async function getEmployeeByIdService(emp_id) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { emp_id },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (employee) {
      const sanitized = { ...employee };
      delete sanitized.password;
      delete sanitized.access_token_set;
      delete sanitized.refresh_token_set;
      return sanitized;
    }

    return null;
  } catch (error) {
    throw error;
  }
}

export { getEmployeeByEmail, getAllEmployeesService, getEmployeeByIdService };


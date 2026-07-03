import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateEmployeeCode } from "../../utils/generateEmployeeCode.js";
import { randomUUID } from "crypto";
import { saveSetupToken } from "../otp/setupTokenRedisService.js";
import { mailQueue } from "../../queues/mailQueue.js";
import { createPasswordHtml } from "../../modules/mail/createPasswordHtml.js";

async function createEmployeeService(employeeData) {
  let { empCode } = employeeData;

  if (!empCode) {
    empCode = await generateEmployeeCode();
  }

  const {
    first_name,
    last_name,
    email,
    profile_image,
    address,
    phone_number,
    date_of_birth,
    joining_date,
    employment_type,
    gender,
    emergency_contact_name,
    emergency_contact_number,
    role_id,
  } = employeeData;

  //email in smaller case
  const lowerCaseEmail = email.toLowerCase();

  const roleExists = await prisma.role.findUnique({
    where: { role_id },
  });

  if (!roleExists) {
    throw new ApiError(400, `Invalid role_id: Role does not exist.`);
  }

  const existingEmployee = await prisma.employee.findFirst({
    where: {
      OR: [{ email: lowerCaseEmail }, { empCode }, { phone_number }],
    },
  });

  if (existingEmployee) {
    if (existingEmployee.email === lowerCaseEmail) {
      throw new ApiError(400, "An employee with this email already exists.");
    }
    if (existingEmployee.empCode === empCode) {
      throw new ApiError(
        400,
        "An employee with this employee code already exists.",
      );
    }
    if (existingEmployee.phone_number === phone_number) {
      throw new ApiError(
        400,
        "An employee with this phone number already exists.",
      );
    }
  }

  try {
    const newEmployee = await prisma.employee.create({
      data: {
        empCode,
        first_name,
        last_name,
        email: lowerCaseEmail,
        profile_image,
        address,
        phone_number,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        joining_date: new Date(joining_date),
        employment_type,
        gender,
        employee_status: "in_active", // Created as inactive
        is_email_verified: false, // Email is not verified yet
        password: null, // No password initially
        emergency_contact_name,
        emergency_contact_number,
        role_id,
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Generate a secure setup token (UUID)
    const setupToken = randomUUID();

    // Save the setup token in Redis (valid for 24 hours)
    await saveSetupToken(email, setupToken);

    // Enqueue setup email to mailQueue
    const frontendUrl = process.env.FRONTEND_URL || "http://192.168.1.18:5173";
    const setupLink = `${frontendUrl}/create-password?email=${encodeURIComponent(email)}&token=${setupToken}`;
    const htmlContent = createPasswordHtml(setupLink, first_name || "Employee");

    await mailQueue.add("send-setup-email", {
      to: email,
      subject: "Set Up Your CRM Account Password",
      text: htmlContent,
    });

    const sanitizedEmployee = { ...newEmployee };
    delete sanitizedEmployee.password;

    return sanitizedEmployee;
  } catch (error) {
    if (error.code === "P2002") {
      const targets = error.meta?.target || [];
      throw new ApiError(
        400,
        `Unique constraint failed on field(s): ${targets.join(", ")}`,
      );
    }
    throw new ApiError(
      500,
      "Internal Server Error occurred while creating the employee.",
    );
  }
}

export { createEmployeeService };

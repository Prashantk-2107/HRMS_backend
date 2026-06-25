import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { getSetupToken, deleteSetupToken } from "../otp/setupTokenRedisService.js";

async function createPasswordService({ email, password, token }) {
  const lowerCaseEmail = email ? email.toLowerCase() : "";
  const employee = await prisma.employee.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (!employee) {
    throw new ApiError(404, "Employee with this email not found");
  }

  // Retrieve setup token from Redis and verify it
  const savedToken = await getSetupToken(lowerCaseEmail);

  if (!savedToken || savedToken !== token) {
    throw new ApiError(400, "Invalid or expired password setup link");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Set the password and verify the email (keeps employee_status: "in_active")
  await prisma.employee.update({
    where: { emp_id: employee.emp_id },
    data: {
      password: hashedPassword,
      is_email_verified: true,
    },
  });

  // Delete the setup token from Redis
  await deleteSetupToken(lowerCaseEmail);

  return true;
}

export { createPasswordService };

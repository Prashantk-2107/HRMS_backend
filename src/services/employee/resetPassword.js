import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

import { getOtp, deleteOtp } from "../otp/otpRedisService.js";

async function resetPasswordService({
  email,
  password,
  purpose,
  tempToken,
  oldPassword,
}) {
  const lowerCaseEmail = email ? email.toLowerCase() : "";
  const employee = await prisma.employee.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (!employee) {
    throw new ApiError(404, "Employee with this email not found");
  }

  if (purpose === "reset_password") {
    if (!oldPassword) {
      throw new ApiError(400, "Old password is required to reset password");
    }
    if (employee.password) {
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        employee.password,
      );
      if (!isOldPasswordValid) {
        throw new ApiError(400, "Invalid current (old) password");
      }
    }
  }

  const verifiedOtp = await getOtp(employee.emp_id, purpose, tempToken);

  if (!verifiedOtp || !verifiedOtp.is_verified) {
    throw new ApiError(
      400,
      "OTP verification required. Please verify your OTP code first.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.employee.update({
    where: { emp_id: employee.emp_id },
    data: {
      password: hashedPassword,
      is_email_verified: true,
    },
  });

  await deleteOtp(employee.emp_id, purpose, tempToken);

  return true;
}

export { resetPasswordService };

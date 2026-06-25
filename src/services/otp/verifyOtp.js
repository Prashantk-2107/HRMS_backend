import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

import {
  getOtp,
  markOtpVerified,
  incrementOtpAttempts,
} from "./otpRedisService.js";

async function verifyOtpService({ email, otp_code, purpose, tempToken }) {
  const lowerCaseEmail = email ? email.toLowerCase() : "";
  const employee = await prisma.employee.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (!employee) {
    throw new ApiError(404, "Employee with this email not found");
  }

  const activeOtp = await getOtp(employee.emp_id, purpose, tempToken);

  if (!activeOtp) {
    throw new ApiError(400, "OTP has expired or has not been requested");
  }

  const isOtpValid = await bcrypt.compare(otp_code, activeOtp.otp_code);
  if (!isOtpValid) {
    const attempts = await incrementOtpAttempts(
      employee.emp_id,
      purpose,
      tempToken,
    );
    if (attempts >= 5) {
      throw new ApiError(
        400,
        "Too many failed verification attempts. This OTP has been invalidated.",
      );
    }
    throw new ApiError(
      400,
      `Invalid OTP code. ${5 - attempts} attempt(s) remaining.`,
    );
  }

  await markOtpVerified(
    employee.emp_id,
    purpose,
    activeOtp.otp_code,
    tempToken,
  );

  return true;
}

export { verifyOtpService };

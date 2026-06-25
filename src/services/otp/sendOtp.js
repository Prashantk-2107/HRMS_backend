import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateOTP } from "./generateOtp.js";
import { setOtp, getOtpCooldownTime, setOtpCooldown } from "./otpRedisService.js";
import { mailQueue } from "../../queues/mailQueue.js";
import { sendOtpHtml } from "../../modules/mail/otpHtml.js";

async function sendOtpService({ email, purpose }) {
  const lowerCaseEmail = email ? email.toLowerCase() : "";
  const employee = await prisma.employee.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (!employee) {   
    throw new ApiError(404, "Employee with this email not found");
  }

  const cooldownTime = await getOtpCooldownTime(employee.emp_id, purpose);
  if (cooldownTime > 0) {
    const minutes = Math.floor(cooldownTime / 60);
    const seconds = cooldownTime % 60;
    const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    throw new ApiError(400, `An OTP was already sent. Please wait ${timeString} before requesting a new one.`);
  }

  const otp = generateOTP();

  const hashedOtp = await bcrypt.hash(otp, 10);
  const tempToken = await setOtp(employee.emp_id, purpose, hashedOtp);
  await setOtpCooldown(employee.emp_id, purpose);

  const htmlContent = sendOtpHtml(otp, employee.first_name || "Employee");
  const subjectMap = {
    create_password: "Set Your Account Password - OTP Verification",
    forget_password: "Reset Your Account Password - OTP Verification",
    reset_password: "Update Your Account Password - OTP Verification",
  };

  await mailQueue.add("send-otp-email", {
    to: email,
    subject: subjectMap[purpose],
    text: htmlContent,
  });

  return tempToken;
}

export { sendOtpService };

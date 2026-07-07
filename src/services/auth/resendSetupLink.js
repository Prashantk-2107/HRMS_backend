import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { randomUUID } from "crypto";
import { saveSetupToken } from "../otp/setupTokenRedisService.js";
import { mailQueue } from "../../queues/mailQueue.js";
import { createPasswordHtml } from "../../modules/mail/createPasswordHtml.js";

async function resendSetupLinkService({ email, frontendUrl }) {
  const lowerCaseEmail = email ? email.toLowerCase() : "";
  const employee = await prisma.employee.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (!employee) {
    throw new ApiError(404, "Employee with this email not found");
  }

  // If password is already set, they shouldn't trigger password setup
  if (employee.password) {
    throw new ApiError(
      400,
      "Account has already set up a password. Please use login or forgot password options."
    );
  }

  // Generate a secure random setup token
  const setupToken = randomUUID();

  // Save the setup token in Redis (valid for 24 hours)
  await saveSetupToken(lowerCaseEmail, setupToken);

  // Enqueue setup email to mailQueue
  const resolvedFrontendUrl = frontendUrl || process.env.FRONTEND_URL || "http://localhost:3000";
  const setupLink = `${resolvedFrontendUrl}/create-password?email=${encodeURIComponent(lowerCaseEmail)}&token=${setupToken}`;
  const htmlContent = createPasswordHtml(setupLink, employee.first_name || "Employee");

  await mailQueue.add("send-setup-email", {
    to: lowerCaseEmail,
    subject: "Set Up Your CRM Account Password",
    text: htmlContent,
  });

  return true;
}

export { resendSetupLinkService };

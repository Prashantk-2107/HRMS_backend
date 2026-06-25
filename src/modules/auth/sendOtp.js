import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { sendOtpSchema } from "../../validations/auth.validation.js";
import { sendOtpService } from "../../services/otp/sendOtp.js";

const sendOtpController = asyncHandler(async (req, res) => {
  const validation = sendOtpSchema.safeParse(req.body);
  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const tempToken = await sendOtpService(validation.data);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "OTP sent successfully to your email. Please verify it.",
        { email: validation.data.email, tempToken },
      ),
    );
});

export { sendOtpController };

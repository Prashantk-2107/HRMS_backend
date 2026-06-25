import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { verifyOtpSchema } from "../../validations/auth.validation.js";
import { verifyOtpService } from "../../services/otp/verifyOtp.js";

const verifyOtpController = asyncHandler(async (req, res) => {
  const validation = verifyOtpSchema.safeParse(req.body);
  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  await verifyOtpService(validation.data);

  return res
    .status(200)
    .json(new ApiResponse(200, "OTP verified successfully. You can now proceed.", { email: validation.data.email, purpose: validation.data.purpose }));
});

export { verifyOtpController };

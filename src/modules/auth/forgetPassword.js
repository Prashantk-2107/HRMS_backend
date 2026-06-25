import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { forgetPasswordSchema } from "../../validations/auth.validation.js";
import { resetPasswordService } from "../../services/employee/resetPassword.js";

const forgetPassword = asyncHandler(async (req, res) => {
  const validation = forgetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  await resetPasswordService({ ...validation.data, purpose: "forget_password" });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully. You can now log in.", { email: validation.data.email }));
});

export { forgetPassword };

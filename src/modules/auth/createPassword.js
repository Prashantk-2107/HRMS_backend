import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createPasswordSchema } from "../../validations/auth.validation.js";
import { createPasswordService } from "../../services/employee/createPassword.js";

const createPassword = asyncHandler(async (req, res) => {
  const validation = createPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  await createPasswordService(validation.data);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Password set successfully. Your email is now verified. Please contact an administrator to activate your account."
      )
    );
});

export { createPassword };

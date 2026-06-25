import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { resendSetupLinkSchema } from "../../validations/auth.validation.js";
import { resendSetupLinkService } from "../../services/auth/resendSetupLink.js";

const resendSetupLink = asyncHandler(async (req, res) => {
  const validation = resendSetupLinkSchema.safeParse(req.body);
  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  await resendSetupLinkService(validation.data);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Invitation setup link has been resent successfully to your email."
      )
    );
});

export { resendSetupLink };

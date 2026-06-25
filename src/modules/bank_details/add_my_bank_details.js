import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { addBankDetailsService } from "../../services/bank_details/addBankDetails.js";
import { addMyBankDetailsSchema } from "../../validations/bank_details.validation.js";

/**
 * Controller to handle employees adding their own bank details.
 */
const addMyBankDetails = asyncHandler(async (req, res) => {
  const validation = addMyBankDetailsSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  // Set emp_id dynamically from the authenticated employee's session/token
  const payload = {
    ...validation.data,
    emp_id: req.employee.emp_id,
  };

  const createdBankDetails = await addBankDetailsService(payload);

  return res.status(201).json(
    new ApiResponse(201, "Your bank details added successfully", {
      bank_details: createdBankDetails,
    })
  );
});

export { addMyBankDetails };

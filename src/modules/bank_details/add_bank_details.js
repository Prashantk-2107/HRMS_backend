import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { addBankDetailsService } from "../../services/bank_details/addBankDetails.js";
import { addBankDetailsSchema } from "../../validations/bank_details.validation.js";

/**
 * Controller to handle adding bank details for an employee.
 */
const addBankDetails = asyncHandler(async (req, res) => {
  const validation = addBankDetailsSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const createdBankDetails = await addBankDetailsService(validation.data);

  return res.status(201).json(
    new ApiResponse(201, "Employee bank details added successfully", {
      bank_details: createdBankDetails,
    })
  );
});

export { addBankDetails };

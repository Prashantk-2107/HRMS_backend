import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { updateBankDetailsService } from "../../services/bank_details/updateBankDetails.js";
import { updateBankDetailsSchema } from "../../validations/bank_details.validation.js";

/**
 * Controller to handle updating existing bank details of an employee.
 */
const updateBankDetails = asyncHandler(async (req, res) => {
  const { emp_bank_id } = req.params;

  if (!emp_bank_id) {
    throw new ApiError(400, "Employee bank ID parameter (emp_bank_id) is required.");
  }

  const validation = updateBankDetailsSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  // If request body is empty after validation, prevent empty updates
  if (Object.keys(validation.data).length === 0) {
    throw new ApiError(400, "Please provide at least one field to update.");
  }

  const updatedBankDetails = await updateBankDetailsService(emp_bank_id, validation.data);

  return res.status(200).json(
    new ApiResponse(200, "Employee bank details updated successfully", {
      bank_details: updatedBankDetails,
    })
  );
});

export { updateBankDetails };

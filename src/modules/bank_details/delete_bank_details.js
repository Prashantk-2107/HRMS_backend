import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { deleteBankDetailsService } from "../../services/bank_details/deleteBankDetails.js";

/**
 * Controller to handle deleting a specific bank details record.
 */
const deleteBankDetails = asyncHandler(async (req, res) => {
  const { emp_bank_id } = req.params;

  if (!emp_bank_id) {
    throw new ApiError(400, "Employee bank ID parameter (emp_bank_id) is required.");
  }

  // Basic validation of uuid format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(emp_bank_id)) {
    throw new ApiError(400, "Invalid Employee Bank ID format (must be a valid UUID).");
  }

  const deletedRecord = await deleteBankDetailsService(emp_bank_id);

  return res.status(200).json(
    new ApiResponse(200, "Employee bank details deleted successfully", {
      bank_details: deletedRecord,
    })
  );
});

export { deleteBankDetails };

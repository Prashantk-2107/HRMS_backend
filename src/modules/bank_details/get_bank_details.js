import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getBankDetailsService } from "../../services/bank_details/getBankDetails.js";

/**
 * Controller to handle fetching bank details of a specific employee.
 */
const getBankDetails = asyncHandler(async (req, res) => {
  const { emp_id } = req.params;

  if (!emp_id) {
    throw new ApiError(400, "Employee ID parameter (emp_id) is required.");
  }

  // Basic validation of uuid format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(emp_id)) {
    throw new ApiError(400, "Invalid Employee ID format (must be a valid UUID).");
  }

  const bankDetailsList = await getBankDetailsService(emp_id);

  return res.status(200).json(
    new ApiResponse(200, "Employee bank details retrieved successfully", {
      bank_details: bankDetailsList,
    })
  );
});

export { getBankDetails };

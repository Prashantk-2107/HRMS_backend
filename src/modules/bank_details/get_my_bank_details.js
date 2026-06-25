import asyncHandler from "../../utils/asyncHandler.js";
import { getBankDetailsService } from "../../services/bank_details/getBankDetails.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Controller to handle fetching bank details of the logged-in employee.
 */
const getMyBankDetails = asyncHandler(async (req, res) => {
  const emp_id = req.employee.emp_id;

  const bankDetailsList = await getBankDetailsService(emp_id);

  return res.status(200).json(
    new ApiResponse(200, "Your bank details retrieved successfully", {
      bank_details: bankDetailsList,
    })
  );
});

export { getMyBankDetails };

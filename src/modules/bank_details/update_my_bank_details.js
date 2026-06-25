import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";
import { updateBankDetailsService } from "../../services/bank_details/updateBankDetails.js";
import { updateBankDetailsSchema } from "../../validations/bank_details.validation.js";

/**
 * Controller to handle employees updating their own bank details.
 */
const updateMyBankDetails = asyncHandler(async (req, res) => {
  const { emp_bank_id } = req.params;
  const emp_id = req.employee.emp_id;

  if (!emp_bank_id) {
    throw new ApiError(400, "Bank details ID parameter (emp_bank_id) is required.");
  }

  // 1. Verify that the bank details record exists and belongs to the logged-in employee
  const existingRecord = await prisma.employeeBankDetails.findUnique({
    where: { emp_bank_id },
  });

  if (!existingRecord) {
    throw new ApiError(404, "Bank details record not found.");
  }

  if (existingRecord.emp_id !== emp_id) {
    throw new ApiError(
      403,
      "Forbidden: You are not authorized to update these bank details."
    );
  }

  const validation = updateBankDetailsSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  if (Object.keys(validation.data).length === 0) {
    throw new ApiError(400, "Please provide at least one field to update.");
  }

  const updatedBankDetails = await updateBankDetailsService(emp_bank_id, validation.data);

  return res.status(200).json(
    new ApiResponse(200, "Your bank details updated successfully", {
      bank_details: updatedBankDetails,
    })
  );
});

export { updateMyBankDetails };

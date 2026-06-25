import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { verifyDocumentService } from "../../services/documents/verifyDocument.js";

/**
 * Controller to handle employee document verification.
 * Delegates updating document verification status to the service layer.
 */
const verifyDocument = asyncHandler(async (req, res) => {
  const { document_id } = req.params;
  const { status, rejection_reason } = req.body;
  const verified_by = req.employee.emp_id;

  if (!document_id) {
    throw new ApiError(400, "Document ID is required in URL parameters");
  }

  if (!status) {
    throw new ApiError(400, "Verification status is required");
  }

  const updatedDocument = await verifyDocumentService({
    document_id,
    status,
    rejection_reason,
    verified_by,
  });

  return res.status(200).json(
    new ApiResponse(200, "Document verification status updated successfully", {
      document: updatedDocument,
    }),
  );
});

export { verifyDocument };

import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to handle document verification (approve/reject).
 * @param {object} params
 * @param {string} params.document_id - The ID of the document.
 * @param {string} params.status - The new status ('verified' or 'rejected').
 * @param {string} [params.rejection_reason] - Reason if document is rejected.
 * @param {string} params.verified_by - The ID of the employee verifying the document.
 * @returns {Promise<object>} The updated document record.
 */
async function verifyDocumentService({
  document_id,
  status,
  rejection_reason,
  verified_by,
}) {
  // Check if status is valid
  if (status !== "verified" && status !== "rejected") {
    throw new ApiError(400, "Invalid status. Allowed values are 'verified' or 'rejected'");
  }

  // If rejected, rejection reason is required
  if (status === "rejected" && (!rejection_reason || !rejection_reason.trim())) {
    throw new ApiError(400, "Rejection reason is required when rejecting a document");
  }

  // Check if document exists
  const document = await prisma.employeeDocument.findUnique({
    where: { document_id },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  // Check if verifier exists
  const verifier = await prisma.employee.findUnique({
    where: { emp_id: verified_by },
  });

  if (!verifier) {
    throw new ApiError(404, "Verifier employee not found");
  }

  // Update the document record
  const updatedDocument = await prisma.employeeDocument.update({
    where: { document_id },
    data: {
      verification_status: status,
      verified_by,
      verified_at: new Date(),
      rejection_reason: status === "rejected" ? rejection_reason : null,
    },
  });

  return updatedDocument;
}

export { verifyDocumentService };

import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { deleteDocsService } from "../../services/documents/deleteDocs.js";

/**
 * Controller to handle document deletion by UUID.
 * Accessible only by roles with the 'emp:remove_documents' permission (Super_admin, HR).
 */
const deleteDocs = asyncHandler(async (req, res) => {
  const { document_id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(document_id)) {
    throw new ApiError(400, "Invalid document ID format");
  }

  const deletedDoc = await deleteDocsService(document_id);

  return res.status(200).json(
    new ApiResponse(200, "Document deleted successfully", {
      document: deletedDoc,
    }),
  );
});

export { deleteDocs };

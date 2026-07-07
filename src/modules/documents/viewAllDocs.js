import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { viewAllDocsService } from "../../services/documents/viewAllDocs.js";

/**
 * Controller to handle retrieving all employee documents.
 * Accessible by roles with the 'emp:view_documents' permission (Super_admin, HR, Project_manager).
 */
const viewAllDocs = asyncHandler(async (req, res) => {
  const { page, limit, search, status, type } = req.query;
  const result = await viewAllDocsService({ page, limit, search, status, type });

  return res.status(200).json(
    new ApiResponse(200, "All documents retrieved successfully", result),
  );
});

export { viewAllDocs };

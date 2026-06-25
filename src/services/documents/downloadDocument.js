import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to fetch document details for download.
 * @param {string} document_id - The ID of the document to download.
 * @returns {Promise<object>} The document details.
 */
async function getDocumentForDownloadService(document_id) {
  if (!document_id) {
    throw new ApiError(400, "Document ID is required");
  }

  const document = await prisma.employeeDocument.findUnique({
    where: { document_id },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return document;
}

export { getDocumentForDownloadService };

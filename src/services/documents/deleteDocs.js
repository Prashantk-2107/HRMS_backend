import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";

/**
 * Service to validate constraints and delete a document.
 * @param {string} document_id - The ID of the document to be deleted.
 * @returns {Promise<object>} The details of the deleted document record.
 */
async function deleteDocsService(document_id) {
  if (!document_id) {
    throw new ApiError(400, "Document ID is required");
  }

  // 1. Verify document exists
  const document = await prisma.employeeDocument.findUnique({
    where: { document_id },
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  // 2. Delete the document record from the database
  const deletedDoc = await prisma.employeeDocument.delete({
    where: { document_id },
  });

  // 3. Delete the file from Cloudinary storage
  if (deletedDoc.file_url) {
    await deleteFromCloudinary(deletedDoc.file_url);
  }

  return deletedDoc;
}

export { deleteDocsService };

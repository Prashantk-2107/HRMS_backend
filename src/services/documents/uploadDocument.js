import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

/**
 * Service to handle uploading a document to Cloudinary and storing details in the DB.
 * @param {object} params
 * @param {string} params.emp_id - The ID of the employee whom the document belongs to.
 * @param {string} params.document_type - Type of the document.
 * @param {string} [params.document_name] - Name of the document.
 * @param {string} [params.document_number] - Unique identifier/number of the document.
 * @param {string} params.localFilePath - Path to the temporarily saved file.
 * @param {string} [params.uploaded_by] - The ID of the user uploading the document.
 * @returns {Promise<object>} The created document record.
 */
async function uploadDocumentService({
  emp_id,
  document_type,
  document_name,
  document_number,
  localFilePath,
  uploaded_by,
}) {
  if (!localFilePath) {
    throw new ApiError(400, "Document file is required");
  }

  // Validate that the target employee exists
  const targetEmployee = await prisma.employee.findUnique({
    where: { emp_id },
  });

  if (!targetEmployee) {
    throw new ApiError(404, "Target employee not found");
  }

  // Validate that the uploader employee exists if specified
  if (uploaded_by) {
    const uploaderEmployee = await prisma.employee.findUnique({
      where: { emp_id: uploaded_by },
    });
    if (!uploaderEmployee) {
      throw new ApiError(404, "Uploader employee not found");
    }
  }

  // Upload to Cloudinary under the 'employee_documents' folder
  const cloudinaryResponse = await uploadOnCloudinary(localFilePath, "employee_documents");

  if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
    throw new ApiError(500, "Failed to upload document to cloud storage");
  }

  // Save the document metadata in the database
  const document = await prisma.employeeDocument.create({
    data: {
      emp_id,
      document_type,
      document_name: document_name || null,
      document_number: document_number || null,
      file_url: cloudinaryResponse.secure_url,
      uploaded_by: uploaded_by || null,
    },
  });

  return document;
}

export { uploadDocumentService };

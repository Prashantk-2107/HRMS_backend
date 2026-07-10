import fs from "fs";
import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadDocumentService } from "../../services/documents/uploadDocument.js";
import { uploadDocumentSchema } from "../../validations/document.validation.js";

/**
 * Controller to handle employee document uploads.
 * Delegates file uploading and database updates to the service layer.
 */
const uploadDocument = asyncHandler(async (req, res) => {
  try {
    // Validate request body using Zod schema
    const validation = uploadDocumentSchema.safeParse(req.body);

    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new ApiError(400, "Validation failed", formattedErrors);
    }

    const localFilePath = req.file?.path;

    if (!localFilePath) {
      throw new ApiError(400, "Document file is required");
    }

    const { emp_id, document_type, document_name, document_number } = validation.data;
    const uploaded_by = req.employee.emp_id;

    // Delegate core uploader & database logic to service layer
    const savedDocument = await uploadDocumentService({
      emp_id,
      document_type,
      document_name,
      document_number,
      localFilePath,
      uploaded_by,
    });

    return res.status(201).json(
      new ApiResponse(201, "Document uploaded successfully", {
        document: savedDocument,
      }),
    );
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        if (unlinkError.code !== "ENOENT") {
          console.error("Failed to delete local file in error catch:", unlinkError);
        }
      }
    }
    throw error;
  }
});

export { uploadDocument };

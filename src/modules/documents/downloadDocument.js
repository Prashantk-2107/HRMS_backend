import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { getDocumentForDownloadService } from "../../services/documents/downloadDocument.js";
import prisma from "../../config/db.js";
import { Readable } from "stream";

/**
 * Controller to handle downloading a document.
 * Verifies that the requester is the owner of the document or has the 'emp:view_documents' permission.
 */
const downloadDocument = asyncHandler(async (req, res) => {
  const { document_id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(document_id)) {
    throw new ApiError(400, "Invalid document ID format");
  }

  const document = await getDocumentForDownloadService(document_id);

  // Check authorization:
  // 1. Is the user the owner of the document?
  const isOwner = document.emp_id === req.employee.emp_id;

  // 2. Does the user have permission to view any document (Super Admin, HR, Project Manager)?
  let hasViewPermission = false;
  if (req.employee.role_id) {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role_id: req.employee.role_id,
        permission: {
          name: "emp:view_documents",
          is_active: true,
        },
      },
    });
    if (rolePermission) {
      hasViewPermission = true;
    }
  }

  if (!isOwner && !hasViewPermission) {
    throw new ApiError(403, "Forbidden: You are not authorized to download this document");
  }

  // Fetch file content from Cloudinary
  try {
    const fileResponse = await fetch(document.file_url);
    if (!fileResponse.ok) {
      throw new ApiError(502, "Failed to fetch document from cloud storage");
    }

    const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";
    const extension = document.file_url.split(".").pop() || "";
    const filename = `${document.document_name || document.document_type || "document"}.${extension}`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Stream response directly to client rather than holding full file in memory
    Readable.fromWeb(fileResponse.body).pipe(res);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to download the document", [error.message]);
  }
});

export { downloadDocument };

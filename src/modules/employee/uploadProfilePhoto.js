import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadProfilePhotoService } from "../../services/employee/uploadProfilePhoto.js";

/**
 * Controller to handle employee profile photo uploads.
 * Delegates file uploading and database updates to the service layer.
 */
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Profile photo file is required");
  }

  // Delegate core uploader & database logic to service layer
  const sanitizedEmployee = await uploadProfilePhotoService(req.employee.emp_id, localFilePath);

  return res.status(200).json(
    new ApiResponse(200, "Profile photo uploaded successfully", {
      employee: sanitizedEmployee,
    }),
  );
});

export { uploadProfilePhoto };

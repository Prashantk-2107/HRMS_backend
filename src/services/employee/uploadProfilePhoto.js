import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

/**
 * Service to handle uploading profile photo to Cloudinary and updating DB record.
 * @param {string} emp_id - The employee ID.
 * @param {string} localFilePath - Path to the temporarily saved file.
 * @returns {Promise<object>} The updated and sanitized employee object.
 */
async function uploadProfilePhotoService(emp_id, localFilePath) {
  if (!localFilePath) {
    throw new ApiError(400, "Profile photo file is required");
  }

  // Upload to Cloudinary under the 'profile_photos' folder
  const cloudinaryResponse = await uploadOnCloudinary(localFilePath, "profile_photos");

  if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
    throw new ApiError(500, "Failed to upload profile photo to cloud storage");
  }

  // Update employee record with the Cloudinary secure URL
  const updatedEmployee = await prisma.employee.update({
    where: { emp_id },
    data: {
      profile_image: cloudinaryResponse.secure_url,
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  // Sanitize the updated employee details
  const sanitizedEmployee = { ...updatedEmployee };
  delete sanitizedEmployee.password;

  return sanitizedEmployee;
}

export { uploadProfilePhotoService };

import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/**
 * Uploads a local file to Cloudinary and deletes it locally.
 * @param {string} localFilePath - Path to the local file.
 * @param {string} [folder="crm_uploads"] - Cloudinary destination folder.
 * @returns {Promise<object|null>} The Cloudinary upload response or null.
 */
const uploadOnCloudinary = async (localFilePath, folder = "crm_uploads") => {
  try {
    if (!localFilePath) return null;

    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder,
    });

    // File uploaded successfully, remove the local file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return response;
  } catch (error) {
    // Ensure the local file is cleaned up even if the upload failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

/**
 * Deletes a file from Cloudinary given its secure URL.
 * @param {string} fileUrl - Secure URL of the file stored in Cloudinary.
 * @returns {Promise<object|null>} The Cloudinary deletion response or null.
 */
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    // Standard Cloudinary URL structure:
    // https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<folder>/<public_id>.<extension>
    const parts = fileUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // Get the parts after "upload/v[something]/"
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join("/"); // e.g. folder/public_id.jpg
    
    // Remove the extension
    const lastDotIndex = publicIdWithExtension.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 ? publicIdWithExtension.substring(0, lastDotIndex) : publicIdWithExtension;

    // Get resource_type from the segment preceding "upload" (e.g. image, video, raw)
    const resourceType = parts[uploadIndex - 1] || "image";

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return response;
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };

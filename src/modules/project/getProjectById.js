import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getProjectByIdService } from "../../services/project/getProjectById.service.js";

/**
 * Controller to handle fetching details for a single project by project_id.
 */
const getProjectById = asyncHandler(async (req, res) => {
  const { project_id } = req.params;

  if (!project_id) {
    throw new ApiError(400, "Project ID parameter is required");
  }

  const project = await getProjectByIdService(project_id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Project details retrieved successfully", { project })
  );
});

export { getProjectById };

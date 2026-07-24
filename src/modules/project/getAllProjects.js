import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getAllProjectsService } from "../../services/project/getAllProjects.service.js";

/**
 * Controller to handle fetching all projects with optional search, pagination, and status filtering.
 */
const getAllProjects = asyncHandler(async (req, res) => {
  const { page, limit, search, status } = req.query;

  const result = await getAllProjectsService({
    page,
    limit,
    search,
    status,
  });

  return res.status(200).json(
    new ApiResponse(200, "Projects retrieved successfully", result)
  );
});

export { getAllProjects };

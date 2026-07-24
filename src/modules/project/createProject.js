import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createProjectService } from "../../services/project/createProject.service.js";
import { createProjectSchema } from "../../validations/project.validation.js";

/**
 * Controller to handle creating a new project.
 */
const createProject = asyncHandler(async (req, res) => {
  const validation = createProjectSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  const creatorEmpId = req.employee.emp_id;
  const newProject = await createProjectService(validation.data, creatorEmpId);

  return res.status(201).json(
    new ApiResponse(201, "Project created successfully", {
      project: newProject,
    })
  );
});

export { createProject };

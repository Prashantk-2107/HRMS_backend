import { Router } from "express";
import { createProject } from "../modules/project/createProject.js";
import { getAllProjects } from "../modules/project/getAllProjects.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = Router();

// Apply auth middleware to all project routes
router.use(verifyJWT);

// Endpoint: GET /api/v1/projects & GET /api/v1/projects/get-all-projects
router.get(
  "/get-all-projects",
  checkPermission("project:view_all"),
  getAllProjects
);

router.get(
  "/",
  checkPermission("project:view_all"),
  getAllProjects
);

// Endpoint: POST /api/v1/projects/create-project & POST /api/v1/projects
router.post(
  "/create-project",
  checkPermission("project:create"),
  createProject
);

router.post(
  "/",
  checkPermission("project:create"),
  createProject
);

export default router;

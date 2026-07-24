import { Router } from "express";
import { createProject } from "../modules/project/createProject.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = Router();

// Apply auth middleware to all project routes
router.use(verifyJWT);

// Endpoint: POST /api/v1/projects/create-project (or POST /api/v1/projects)
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

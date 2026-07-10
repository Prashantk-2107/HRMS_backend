import { Router } from "express";
import { createRequest } from "../modules/leave/createRequest.js";
import { getMyLeaves } from "../modules/leave/getMyLeaves.js";
import { getPendingLeaves } from "../modules/leave/getPendingLeaves.js";
import { approveRequest } from "../modules/leave/approveRequest.js";
import { rejectRequest } from "../modules/leave/rejectRequest.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = Router();

// Apply authentication middleware to all leave routes
router.use(verifyJWT);

router.post("/request", createRequest);
router.get("/my", getMyLeaves);
router.get("/pending", checkPermission("leave:view_pending"), getPendingLeaves);
router.post("/:id/approve", checkPermission("leave:approve"), approveRequest);
router.post("/:id/reject", checkPermission("leave:reject"), rejectRequest);

export default router;

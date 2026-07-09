import { Router } from "express";
import { checkIn } from "../modules/attendance/checkIn.js";
import { checkOut } from "../modules/attendance/checkOut.js";
import { getTodayAttendance } from "../modules/attendance/getTodayAttendance.js";
import { getMyAttendanceSummary } from "../modules/attendance/getMyAttendanceSummary.js";
import { createRequest } from "../modules/attendance/createRequest.js";
import { getMyRequests } from "../modules/attendance/getMyRequests.js";
import { getPendingRequests } from "../modules/attendance/getPendingRequests.js";
import { approveRequest } from "../modules/attendance/approveRequest.js";
import { rejectRequest } from "../modules/attendance/rejectRequest.js";
import { getTodayDashboard } from "../modules/attendance/getTodayDashboard.js";
import { getMonthlyReport } from "../modules/attendance/getMonthlyReport.js";
import { getAnalytics } from "../modules/attendance/getAnalytics.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all attendance routes
router.use(verifyJWT);

// Attendance routes
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/today", getTodayAttendance);
router.get("/my-summary", getMyAttendanceSummary);

// Regularization routes
router.post("/regularize", createRequest);
router.get("/regularizations/my", getMyRequests);
router.get("/regularizations/pending", getPendingRequests);
router.post("/regularizations/:id/approve", approveRequest);
router.post("/regularizations/:id/reject", rejectRequest);

// Admin dashboard routes
router.get("/admin/today-dashboard", getTodayDashboard);
router.get("/admin/monthly-report", getMonthlyReport);
router.get("/admin/analytics", getAnalytics);

export default router;

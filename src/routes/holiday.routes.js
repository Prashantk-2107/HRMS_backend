import { Router } from "express";
import { createHoliday } from "../modules/holidays/createHoliday.js";
import { updateHoliday } from "../modules/holidays/updateHoliday.js";
import { deleteHoliday } from "../modules/holidays/deleteHoliday.js";
import { getAllHolidays } from "../modules/holidays/get_all_holidays.js";
import { markWeekends } from "../modules/holidays/markWeekends.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = Router();

// Endpoint: POST /api/v1/holiday/mark-weekends
// Guarded by verifyJWT and checkPermission("holiday:manage")
router.post(
  "/mark-weekends",
  verifyJWT,
  checkPermission("holiday:manage"),
  markWeekends
);

// Endpoint: POST /api/v1/holiday/create-holiday
// Guarded by verifyJWT and checkPermission("holiday:manage")
router.post(
  "/create-holiday",
  verifyJWT,
  checkPermission("holiday:manage"),
  createHoliday
);

// Endpoint: PATCH /api/v1/holiday/update-holiday/:holiday_id
// Guarded by verifyJWT and checkPermission("holiday:manage")
router.patch(
  "/update-holiday/:holiday_id",
  verifyJWT,
  checkPermission("holiday:manage"),
  updateHoliday
);

// Endpoint: DELETE /api/v1/holiday/delete-holiday/:holiday_id
// Guarded by verifyJWT and checkPermission("holiday:manage")
router.delete(
  "/delete-holiday/:holiday_id",
  verifyJWT,
  checkPermission("holiday:manage"),
  deleteHoliday
);

// Endpoint: GET /api/v1/holiday/get-all-holidays
// Guarded by verifyJWT (accessible to any authenticated employee)
router.get(
  "/get-all-holidays",
  verifyJWT,
  getAllHolidays
);

export default router;

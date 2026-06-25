import { Router } from "express";
import { getAllEmployees } from "../modules/employee/getAllEmployees.js";
import { createUser } from "../modules/employee/createEmp.js";
import { setEmployeeStatus } from "../modules/employee/setEmpStatus.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { deleteEmp } from "../modules/employee/deleteEmp.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadProfilePhoto } from "../modules/employee/uploadProfilePhoto.js";
import { updateEmp } from "../modules/employee/updateEmp.js";
import { viewEmp } from "../modules/employee/viewEmp.js";
import { updateEmployeeByAdmin } from "../modules/employee/updateEmployeeByAdmin.js";

const router = Router();

router.get(
  "/get-all-emp",
  verifyJWT,
  checkPermission("emp:get_all"),
  getAllEmployees,
);
router.post(
  "/create-emp",
  verifyJWT,
  checkPermission("emp:create"),
  createUser,
);
router.delete(
  "/delete-emp/:emp_id",
  verifyJWT,
  checkPermission("emp:delete"),
  deleteEmp,
);
router.patch(
  "/set-status",
  verifyJWT,
  checkPermission("emp:update"),
  setEmployeeStatus,
);
router.patch(
  "/upload-profile-photo",
  verifyJWT,
  upload.single("profile_image"),
  uploadProfilePhoto,
);
router.patch("/update-me", verifyJWT, updateEmp);
router.patch(
  "/update-emp/:emp_id",
  verifyJWT,
  checkPermission("emp:update"),
  updateEmployeeByAdmin,
);
router.get(
  "/get-emp/:emp_id",
  verifyJWT,
  checkPermission("emp:view_any"),
  viewEmp,
);

export default router;

import { Router } from "express";
import fs from "fs";
import { uploadDocument } from "../modules/documents/uploadDocument.js";
import { verifyDocument } from "../modules/documents/verifyDocument.js";
import { viewMyDocs } from "../modules/documents/viewMyDocs.js";
import { viewAllDocs } from "../modules/documents/viewAllDocs.js";
import { deleteDocs } from "../modules/documents/deleteDocs.js";
import { downloadDocument } from "../modules/documents/downloadDocument.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
  "/upload",
  verifyJWT,
  upload.single("document"),
  async (req, res, next) => {
    try {
      const targetEmpId = req.body.emp_id;
      const currentEmpId = req.employee.emp_id;

      console.log(`[Upload Auth Check] targetEmpId: ${targetEmpId}, currentEmpId: ${currentEmpId}`);

      // If uploading for self, bypass the emp:add_documents check (case-insensitive string comparison)
      if (targetEmpId && currentEmpId && String(targetEmpId).toLowerCase() === String(currentEmpId).toLowerCase()) {
        return next();
      }

      // Otherwise, run checkPermission("emp:add_documents")
      const checkMiddleware = checkPermission("emp:add_documents");
      await checkMiddleware(req, res, next);
    } catch (error) {
      // If error occurs, clean up the uploaded file
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  },
  uploadDocument
);

router.get(
  "/my-documents",
  verifyJWT,
  viewMyDocs
);

router.get(
  "/all-documents",
  verifyJWT,
  checkPermission("emp:view_documents"),
  viewAllDocs
);

router.patch(
  "/:document_id/verify",
  verifyJWT,
  checkPermission("emp:verify_documents"),
  verifyDocument
);

router.delete(
  "/delete/:document_id",
  verifyJWT,
  checkPermission("emp:remove_documents"),
  deleteDocs
);

router.get(
  "/download/:document_id",
  verifyJWT,
  downloadDocument
);

export default router;

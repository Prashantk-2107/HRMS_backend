import { Router } from "express";
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
  checkPermission("emp:add_documents"),
  upload.single("document"),
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

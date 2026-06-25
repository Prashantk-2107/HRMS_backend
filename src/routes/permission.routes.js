import { Router } from "express";
import { setExtraPermission } from "../modules/permissions/setExtraPermission.js";
import { deleteExtraPermission } from "../modules/permissions/deleteExtraPermission.js";
import { getAllEmpPermission } from "../modules/permissions/getAllEmpPermission.js";
import { assignPermissionToRole } from "../modules/permissions/assignPermissionTorole.js";
import { grantRevokePermission } from "../modules/permissions/grant_revoke_permission.js";
import { getAllPermissions } from "../modules/permissions/get_all_permissions.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const route = Router();

route
  .route("/set-extra-permission")
  .post(verifyJWT, checkPermission("emp:grant_extra_permission"), setExtraPermission);

route
  .route("/delete-extra-permission")
  .delete(verifyJWT, checkPermission("emp:grant_extra_permission"), deleteExtraPermission);

route
  .route("/emp-permissions/:emp_id")
  .get(verifyJWT, getAllEmpPermission);

route
  .route("/assign-permission-to-role")
  .post(verifyJWT, checkPermission("role:update"), assignPermissionToRole);

route
  .route("/grant-revoke-permission")
  .post(verifyJWT, checkPermission("permission:grantAndRevoke"), grantRevokePermission);

route
  .route("/get-all-permissions")
  .get(verifyJWT, checkPermission("role:get_all"), getAllPermissions);

export default route;

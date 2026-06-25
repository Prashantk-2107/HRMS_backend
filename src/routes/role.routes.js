import { Router } from "express";
import { createRole } from "../modules/role/createRole.js";
import { assignRole } from "../modules/role/assignRole.js";
import { deleteRole } from "../modules/role/deleteRole.js";
import { getAllRoles } from "../modules/role/get_all_role.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const route = Router();

route
  .route("/create-role")
  .post(verifyJWT, checkPermission("role:create"), createRole);

route
  .route("/assign-role")
  .patch(verifyJWT, checkPermission("emp:assign_role"), assignRole);

route
  .route("/delete-role/:role_id")
  .delete(verifyJWT, checkPermission("role:delete"), deleteRole);

route
  .route("/get-all-roles")
  .get(verifyJWT, checkPermission("role:get_all"), getAllRoles);

export default route;

import { Router } from "express";
import { addBankDetails } from "../modules/bank_details/add_bank_details.js";
import { updateBankDetails } from "../modules/bank_details/update_bank_details.js";
import { getBankDetails } from "../modules/bank_details/get_bank_details.js";
import { deleteBankDetails } from "../modules/bank_details/delete_bank_details.js";
import { getMyBankDetails } from "../modules/bank_details/get_my_bank_details.js";
import { addMyBankDetails } from "../modules/bank_details/add_my_bank_details.js";
import { updateMyBankDetails } from "../modules/bank_details/update_my_bank_details.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.post(
  "/add-bank-details",
  verifyJWT,
  checkPermission("emp:manage_bank_details"),
  addBankDetails
);

router.patch(
  "/update-bank-details/:emp_bank_id",
  verifyJWT,
  checkPermission("emp:manage_bank_details"),
  updateBankDetails
);

router.get(
  "/get-bank-details/:emp_id",
  verifyJWT,
  checkPermission("emp:manage_bank_details"),
  getBankDetails
);

router.delete(
  "/delete-bank-details/:emp_bank_id",
  verifyJWT,
  checkPermission("emp:manage_bank_details"),
  deleteBankDetails
);

router.get(
  "/my-bank-details",
  verifyJWT,
  getMyBankDetails
);

router.post(
  "/add-my-bank-details",
  verifyJWT,
  addMyBankDetails
);

router.patch(
  "/update-my-bank-details/:emp_bank_id",
  verifyJWT,
  updateMyBankDetails
);

export default router;

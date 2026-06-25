import { Router } from "express";
import { loginEmployee } from "../modules/auth/login.js";
import { forgetPassword } from "../modules/auth/forgetPassword.js";
import { resetPassword } from "../modules/auth/resetPassword.js";
import { sendOtpController } from "../modules/auth/sendOtp.js";
import { verifyOtpController } from "../modules/auth/verifyOtp.js";
import { refreshAccessToken } from "../modules/auth/refreshToken.js";
import { logoutEmployee } from "../modules/auth/logout.js";
import { getCurrentProfile } from "../modules/auth/getCurrentProfile.js";
import { createPassword } from "../modules/auth/createPassword.js";
import { resendSetupLink } from "../modules/auth/resendSetupLink.js";
import {
  authRateLimiter,
  verifyOtpRateLimiter,
} from "../middlewares/rateLimiter.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.post("/login", authRateLimiter, loginEmployee);
router.post("/send-otp", authRateLimiter, sendOtpController);
router.post("/verify-otp", verifyOtpRateLimiter, verifyOtpController);
router.post("/forget-password", authRateLimiter, forgetPassword);
router.post("/reset-password", verifyJWT, authRateLimiter, resetPassword);
router.post("/create-password", authRateLimiter, createPassword);
router.post(
  "/resend-setup-link",
  verifyJWT,
  checkPermission("emp:create"),
  authRateLimiter,
  resendSetupLink,
);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutEmployee);
router.get("/me", verifyJWT, getCurrentProfile);

export default router;

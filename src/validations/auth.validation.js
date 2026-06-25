import { z } from "zod";

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters long")
  .max(255, "Password cannot exceed 255 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one digit")
  .regex(
    /[@$!%*?&#]/,
    "Password must contain at least one special character (@, $, !, %, *, ?, &, #)",
  );

const sendOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
  purpose: z.enum(["create_password", "forget_password", "reset_password"], {
    required_error: "Purpose is required",
  }),
});

const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
  otp_code: z
    .string({ required_error: "OTP code is required" })
    .regex(/^\d{6}$/, "OTP code must be exactly 6 digits"),
  purpose: z.enum(["create_password", "forget_password", "reset_password"], {
    required_error: "Purpose is required",
  }),
  tempToken: z
    .string({ required_error: "Temporary token is required" })
    .uuid("Invalid temporary token format"),
});

const forgetPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
  password: passwordSchema,
  tempToken: z
    .string({ required_error: "Temporary token is required" })
    .uuid("Invalid temporary token format"),
});

const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
  oldPassword: z.string({ required_error: "Old password is required" }),
  password: passwordSchema,
  tempToken: z
    .string({ required_error: "Temporary token is required" })
    .uuid("Invalid temporary token format"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
  password: z.string({ required_error: "Password is required" }),
});

const createPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
  password: passwordSchema,
  token: z
    .string({ required_error: "Token is required" })
    .uuid("Invalid token format"),
});

const resendSetupLinkSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
});

export {
  sendOtpSchema,
  verifyOtpSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  loginSchema,
  createPasswordSchema,
  resendSetupLinkSchema,
};

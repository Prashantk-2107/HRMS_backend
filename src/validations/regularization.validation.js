import { z } from "zod";

/**
 * Validation schema for creating a regularization request.
 */
const createRegularizationSchema = z.object({
  attendance_id: z
    .string({ required_error: "Attendance ID is required" })
    .uuid("Invalid Attendance ID format"),
  check_in: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid check-in time format",
    })
    .optional(),
  check_out: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid check-out time format",
    })
    .optional(),
  reason: z
    .string({ required_error: "Reason is required" })
    .min(5, "Reason must be at least 5 characters long")
    .max(255, "Reason cannot exceed 255 characters"),
});

/**
 * Validation schema for rejecting a regularization request.
 */
const rejectRegularizationSchema = z.object({
  rejection_reason: z
    .string({ required_error: "Rejection reason is required" })
    .min(3, "Rejection reason must be at least 3 characters long")
    .max(255, "Rejection reason cannot exceed 255 characters"),
});

export { createRegularizationSchema, rejectRegularizationSchema };

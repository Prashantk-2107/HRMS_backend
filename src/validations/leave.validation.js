import { z } from "zod";

/**
 * Validation schema for creating a leave request.
 */
const createLeaveSchema = z.object({
  start_date: z
    .string({ required_error: "Start date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date format",
    }),
  end_date: z
    .string({ required_error: "End date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date format",
    }),
  leave_type: z.enum(["sick", "casual", "earned", "unpaid"], {
    required_error: "Leave type is required",
    invalid_type_error: "Invalid leave type. Must be sick, casual, earned, or unpaid",
  }),
  reason: z
    .string({ required_error: "Reason is required" })
    .min(5, "Reason must be at least 5 characters long")
    .max(255, "Reason cannot exceed 255 characters"),
}).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
  },
  {
    message: "End date must be on or after start date",
    path: ["end_date"],
  }
);

/**
 * Validation schema for rejecting a leave request.
 */
const rejectLeaveSchema = z.object({
  rejection_reason: z
    .string({ required_error: "Rejection reason is required" })
    .min(3, "Rejection reason must be at least 3 characters long")
    .max(255, "Rejection reason cannot exceed 255 characters"),
});

export { createLeaveSchema, rejectLeaveSchema };

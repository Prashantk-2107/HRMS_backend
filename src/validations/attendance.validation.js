import { z } from "zod";

/**
 * Validation schema for marking check-in.
 */
const checkInSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
  check_in_time: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid check-in time format",
    })
    .optional(),
});

/**
 * Validation schema for marking check-out.
 */
const checkOutSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
  check_out_time: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid check-out time format",
    })
    .optional(),
});

export { checkInSchema, checkOutSchema };

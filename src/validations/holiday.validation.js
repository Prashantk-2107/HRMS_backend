import { z } from "zod";

/**
 * Validation schema for creating a new holiday.
 */
const createHolidaySchema = z.object({
  holiday_date: z
    .string({ required_error: "Holiday date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid holiday date format",
    }),
  holiday_name: z
    .string({ required_error: "Holiday name is required" })
    .min(1, "Holiday name cannot be empty")
    .max(100, "Holiday name cannot exceed 100 characters"),
  holiday_type: z.enum(["national", "festival", "company"], {
    errorMap: () => ({
      message: "Invalid holiday type. Allowed values are 'national', 'festival', or 'company'",
    }),
  }),
});

const updateHolidaySchema = z.object({
  holiday_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid holiday date format",
    })
    .optional(),
  holiday_name: z
    .string()
    .min(1, "Holiday name cannot be empty")
    .max(100, "Holiday name cannot exceed 100 characters")
    .optional(),
  holiday_type: z.enum(["national", "festival", "company"], {
    errorMap: () => ({
      message: "Invalid holiday type. Allowed values are 'national', 'festival', or 'company'",
    }),
  }).optional(),
});

const markWeekendsSchema = z.object({
  year: z
    .number({ required_error: "Year is required" })
    .int()
    .min(1970, "Year must be 1970 or later")
    .max(2100, "Year cannot exceed 2100"),
  month: z
    .number({ required_error: "Month is required" })
    .int()
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
});

export { createHolidaySchema, updateHolidaySchema, markWeekendsSchema };

import { z } from "zod";

/**
 * Validation schema for creating a new project.
 */
const createProjectSchema = z.object({
  project_name: z
    .string({ required_error: "Project name is required" })
    .min(1, "Project name cannot be empty")
    .max(255, "Project name cannot exceed 255 characters"),
  status: z
    .enum(["planning", "active", "on_hold", "completed", "cancelled"], {
      errorMap: () => ({
        message:
          "Invalid status. Allowed values: 'planning', 'active', 'on_hold', 'completed', 'cancelled'",
      }),
    })
    .default("planning"),
  description: z.string().optional(),
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
  members: z
    .array(
      z.object({
        employee_id: z.string().uuid("Invalid employee ID"),
        project_role_id: z.string().uuid("Invalid project role ID").optional(),
      })
    )
    .optional(),
}).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  {
    message: "End date must be on or after start date",
    path: ["end_date"],
  }
);

export { createProjectSchema };

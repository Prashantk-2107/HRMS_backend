import { z } from "zod";

/**
 * Validation schema for creating a new employee.
 * Matches structural requirements and enums defined in Prisma.
 */
const createEmployeeSchema = z.object({
  empCode: z
    .string()
    .min(1, "Employee code cannot be empty")
    .max(20, "Employee code cannot exceed 20 characters")
    .optional(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .max(50, "Email cannot exceed 50 characters")
    .transform((val) => val.toLowerCase()),
  address: z
    .string({ required_error: "Address is required" })
    .min(1, "Address cannot be empty"),
  phone_number: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional()
    .nullable()
    .or(z.literal("")),
  joining_date: z
    .string({ required_error: "Joining date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid joining date format",
    }),
  role_id: z
    .string({ required_error: "Role ID is required" })
    .uuid("Invalid Role ID format (must be a valid UUID)"),

  // Optional fields
  first_name: z
    .string()
    .max(100, "First name cannot exceed 100 characters")
    .optional()
    .nullable(),
  last_name: z
    .string()
    .max(100, "Last name cannot exceed 100 characters")
    .optional()
    .nullable(),
  profile_image: z
    .string()
    .url("Invalid profile image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  date_of_birth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date of birth format",
    })
    .refine((val) => new Date(val) <= new Date(), {
      message: "Date of birth cannot be in the future",
    })
    .optional()
    .nullable(),
  employment_type: z.enum(["permanent", "intern"]).optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  employee_status: z.enum(["active", "in_active"]).optional().nullable(),
  emergency_contact_name: z.string().max(255).optional().nullable(),
  emergency_contact_number: z.string().max(20).optional().nullable(),
}).refine((data) => {
  if (data.joining_date && data.date_of_birth) {
    return new Date(data.joining_date) >= new Date(data.date_of_birth);
  }
  return true;
}, {
  message: "Joining date cannot be before date of birth",
  path: ["joining_date"],
});

const setEmployeeStatusSchema = z.object({
  emp_id: z
    .string({ required_error: "Employee ID is required" })
    .uuid("Invalid Employee ID format (must be a valid UUID)"),
  status: z.enum(["active", "in_active"], {
    errorMap: () => ({
      message: "Invalid status. Allowed values are 'active' or 'in_active'",
    }),
  }),
});

const assignRoleSchema = z.object({
  emp_id: z
    .string({ required_error: "Employee ID is required" })
    .uuid("Invalid Employee ID format (must be a valid UUID)"),
  role_id: z
    .string({ required_error: "Role ID is required" })
    .uuid("Invalid Role ID format (must be a valid UUID)"),
});

const updateEmployeeSchema = z.object({
  first_name: z
    .string()
    .max(100, "First name cannot exceed 100 characters")
    .optional()
    .nullable(),
  last_name: z
    .string()
    .max(100, "Last name cannot exceed 100 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .min(1, "Address cannot be empty")
    .optional(),
  phone_number: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional()
    .nullable()
    .or(z.literal("")),
  emergency_contact_name: z
    .string()
    .max(255)
    .optional()
    .nullable(),
  emergency_contact_number: z
    .string()
    .max(20)
    .optional()
    .nullable(),
});

const adminUpdateEmployeeSchema = z.object({
  first_name: z
    .string()
    .max(100, "First name cannot exceed 100 characters")
    .optional()
    .nullable(),
  last_name: z
    .string()
    .max(100, "Last name cannot exceed 100 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .min(1, "Address cannot be empty")
    .optional(),
  phone_number: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .optional()
    .nullable()
    .or(z.literal("")),
  emergency_contact_name: z
    .string()
    .max(255)
    .optional()
    .nullable(),
  emergency_contact_number: z
    .string()
    .max(20)
    .optional()
    .nullable(),
  joining_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid joining date format",
    })
    .optional(),
  date_of_birth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date of birth format",
    })
    .refine((val) => new Date(val) <= new Date(), {
      message: "Date of birth cannot be in the future",
    })
    .optional()
    .nullable(),
  employment_type: z.enum(["permanent", "intern"]).optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  employee_status: z.enum(["active", "in_active"]).optional().nullable(),
  role_id: z
    .string()
    .uuid("Invalid Role ID format (must be a valid UUID)")
    .optional(),
});

export {
  createEmployeeSchema,
  setEmployeeStatusSchema,
  assignRoleSchema,
  updateEmployeeSchema,
  adminUpdateEmployeeSchema,
};



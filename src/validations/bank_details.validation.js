import { z } from "zod";

/**
 * Validation schema for adding/updating employee bank details.
 */
const addBankDetailsSchema = z.object({
  emp_id: z
    .string({ required_error: "Employee ID is required" })
    .uuid("Invalid Employee ID format (must be a valid UUID)"),
  bank_name: z
    .string({ required_error: "Bank name is required" })
    .min(1, "Bank name cannot be empty")
    .max(100, "Bank name cannot exceed 100 characters"),
  account_number: z
    .string({ required_error: "Account number is required" })
    .min(5, "Account number must be at least 5 characters")
    .max(50, "Account number cannot exceed 50 characters"),
  ifsc_code: z
    .string({ required_error: "IFSC code is required" })
    .min(5, "IFSC code must be at least 5 characters")
    .max(20, "IFSC code cannot exceed 20 characters"),
  branch_address: z
    .string({ required_error: "Branch address is required" })
    .min(1, "Branch address cannot be empty"),
  account_type: z.enum(["savings", "current"], {
    errorMap: () => ({
      message: "Invalid account type. Allowed values are 'savings' or 'current'",
    }),
  }),
});

const updateBankDetailsSchema = z.object({
  bank_name: z
    .string()
    .min(1, "Bank name cannot be empty")
    .max(100, "Bank name cannot exceed 100 characters")
    .optional(),
  account_number: z
    .string()
    .min(5, "Account number must be at least 5 characters")
    .max(50, "Account number cannot exceed 50 characters")
    .optional(),
  ifsc_code: z
    .string()
    .min(5, "IFSC code must be at least 5 characters")
    .max(20, "IFSC code cannot exceed 20 characters")
    .optional(),
  branch_address: z
    .string()
    .min(1, "Branch address cannot be empty")
    .optional(),
  account_type: z.enum(["savings", "current"], {
    errorMap: () => ({
      message: "Invalid account type. Allowed values are 'savings' or 'current'",
    }),
  }).optional(),
});

const addMyBankDetailsSchema = addBankDetailsSchema.omit({ emp_id: true });

export { addBankDetailsSchema, updateBankDetailsSchema, addMyBankDetailsSchema };

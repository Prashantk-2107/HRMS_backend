import { z } from "zod";

/**
 * Validation schema for uploading a new employee document.
 * Matches structural requirements and enums defined in Prisma.
 */
const uploadDocumentSchema = z.object({
  emp_id: z
    .string({ required_error: "Employee ID (emp_id) is required" })
    .uuid("Invalid Employee ID format (must be a valid UUID)"),
  document_name: z
    .string()
    .max(255, "Document name cannot exceed 255 characters")
    .optional()
    .nullable(),
  document_type: z.enum(
    [
      "aadhar",
      "pan",
      "passport",
      "driving_license",
      "degree",
      "experience_letter",
      "offer_letter",
      "other",
    ],
    {
      errorMap: () => ({
        message:
          "Invalid document type. Allowed values: aadhar, pan, passport, driving_license, degree, experience_letter, offer_letter, other",
      }),
    }
  ),
  document_number: z.string().optional().nullable(),
});

export { uploadDocumentSchema };

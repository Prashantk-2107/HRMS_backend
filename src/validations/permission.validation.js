import { z } from "zod";

const setExtraPermissionSchema = z.object({
  emp_id: z
    .string({ required_error: "Employee ID is required" })
    .uuid("Invalid Employee ID format (must be a valid UUID)"),
  permission_id: z
    .string({ required_error: "Permission ID is required" })
    .uuid("Invalid Permission ID format (must be a valid UUID)"),
  isGranted: z.boolean({ required_error: "isGranted status is required" }),
});

const deleteExtraPermissionSchema = z.object({
  emp_id: z
    .string({ required_error: "Employee ID is required" })
    .uuid("Invalid Employee ID format (must be a valid UUID)"),
  permission_id: z
    .string({ required_error: "Permission ID is required" })
    .uuid("Invalid Permission ID format (must be a valid UUID)"),
});

const assignPermissionToRoleSchema = z.object({
  role_id: z
    .string({ required_error: "Role ID is required" })
    .uuid("Invalid Role ID format (must be a valid UUID)"),
  permission_id: z
    .string({ required_error: "Permission ID is required" })
    .uuid("Invalid Permission ID format (must be a valid UUID)"),
});

const grantRevokePermissionSchema = z.object({
  role_id: z
    .string({ required_error: "Role ID is required" })
    .uuid("Invalid Role ID format (must be a valid UUID)"),
  permission_id: z
    .string({ required_error: "Permission ID is required" })
    .uuid("Invalid Permission ID format (must be a valid UUID)"),
  isGranted: z.boolean({ required_error: "isGranted status is required" }),
});

export {
  setExtraPermissionSchema,
  deleteExtraPermissionSchema,
  assignPermissionToRoleSchema,
  grantRevokePermissionSchema,
};

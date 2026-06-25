import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { grantRevokePermissionService } from "../../services/role/grantRevokePermission.js";
import { grantRevokePermissionSchema } from "../../validations/permission.validation.js";

/**
 * Controller to grant or revoke a permission for a role.
 * Accessible by authorized roles (via permission:grantAndRevoke permission).
 */
const grantRevokePermission = asyncHandler(async (req, res) => {
    const validation = grantRevokePermissionSchema.safeParse(req.body);

    if (!validation.success) {
        const formattedErrors = validation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));
        throw new ApiError(400, "Validation failed", formattedErrors);
    }

    const { role_id, permission_id, isGranted } = validation.data;

    // Delegate business logic and database operation to service layer
    const rolePermission = await grantRevokePermissionService(role_id, permission_id, isGranted);

    const statusText = isGranted ? "granted" : "revoked";

    return res.status(200).json(
        new ApiResponse(200, `Permission ${statusText} for role successfully`, {
            rolePermission,
        })
    );
});

export { grantRevokePermission };

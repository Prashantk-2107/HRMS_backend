import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";

/**
 * Controller to fetch all active permissions in the system.
 * Accessible by authorized roles (via role:get_all permission).
 */
const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await prisma.permission.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Permissions retrieved successfully", {
      permissions,
    })
  );
});

export { getAllPermissions };

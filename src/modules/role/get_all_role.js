import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import prisma from "../../config/db.js";

/**
 * Controller to fetch all roles in the database.
 * Accessible by authorized roles (via role:get_all permission).
 */
const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Roles retrieved successfully", {
      roles,
    })
  );
});

export { getAllRoles };

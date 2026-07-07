import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import prisma from "../../config/db.js";

const createRole = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    throw new ApiError(400, "Role name can only contain alphabets and spaces");
  }

  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "_");

  const existingRole = await prisma.role.findUnique({
    where: { name: normalizedName },
  });

  if (existingRole) {
    throw new ApiError(400, "Role already exists");
  }

  const role = await prisma.role.create({
    data: {
      name: normalizedName,
      description,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, "Role created successfully", {
      role,
    }),
  );
});

export { createRole };

import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { ApiError } from "./ApiError.js";

const generateAccessAndRefereshTokens = async (employeeId) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { emp_id: employeeId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    const accessToken = jwt.sign(
      {
        emp_id: employee.emp_id,
        email: employee.email,
        role: employee.role.name,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );

    const refreshToken = jwt.sign(
      {
        emp_id: employee.emp_id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
    );

    // Save tokens in database
    await prisma.employee.update({
      where: { emp_id: employee.emp_id },
      data: {
        access_token_set: accessToken,
        refresh_token_set: refreshToken,
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export { generateAccessAndRefereshTokens };

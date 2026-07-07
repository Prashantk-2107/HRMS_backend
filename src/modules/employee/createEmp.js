import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createEmployeeService } from "../../services/employee/createEmployee.js";
import { createEmployeeSchema } from "../../validations/employee.validation.js";

const createUser = asyncHandler(async (req, res) => {
  const validation = createEmployeeSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", formattedErrors);
  }

  let frontendUrl = req.headers.origin;
  if (!frontendUrl && req.headers.referer) {
    try {
      frontendUrl = new URL(req.headers.referer).origin;
    } catch (e) {
      // ignore
    }
  }

  const createdEmployee = await createEmployeeService({ ...validation.data, frontendUrl });

  return res.status(201).json(
    new ApiResponse(201, "Employee created successfully", {
      employee: createdEmployee,
    }),
  );
});

export { createUser };

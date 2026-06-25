import { getEmployeeByEmail } from "../employee/getEmployee.js";
import { updateEmployee } from "../employee/updateEmployee.js";
import { isPasswordValid } from "../employee/isPasswordValid.js";
import { generateAccessAndRefereshTokens } from "../../utils/generateTokens.js";
import { ApiError } from "../../utils/ApiError.js";

async function loginService({ email, password }) {
  const employee = await getEmployeeByEmail(email);

  if (!employee) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (employee.employee_status !== "active") {
    throw new ApiError(
      403,
      "Your account is inactive. Please contact support.",
    );
  }

  if (!employee.is_email_verified || !employee.password) {
    throw new ApiError(
      400,
      "Please setup your password and verify your email using the OTP sent to your email.",
    );
  }

  const validPassword = await isPasswordValid(password, employee.password);
  if (!validPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    employee.emp_id,
  );

  await updateEmployee(employee.emp_id, {
    last_login_at: new Date(),
  });

  const loggedInEmployee = { ...employee };
  delete loggedInEmployee.password;
  delete loggedInEmployee.access_token_set;
  delete loggedInEmployee.refresh_token_set;

  return {
    employee: loggedInEmployee,
    accessToken,
    refreshToken,
  };
}

export { loginService };

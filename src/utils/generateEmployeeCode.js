import prisma from "../config/db.js";

/**
 * Generates the next sequential employee code.
 * Format: EMP001, EMP002, ..., EMP010, EMP100, etc.
 * Checks the database for existing employee codes to find the highest number.
 *
 * @returns {Promise<string>} The next employee code
 */
export async function generateEmployeeCode() {
  // Find the single highest employee code starting with "EMP"
  const latestEmployee = await prisma.employee.findFirst({
    where: {
      empCode: {
        startsWith: "EMP",
        mode: "insensitive",
      },
    },
    orderBy: {
      empCode: "desc",
    },
    select: {
      empCode: true,
    },
  });

  let maxNum = 0;

  if (latestEmployee && latestEmployee.empCode) {
    const match = latestEmployee.empCode.match(/^EMP(\d+)$/i);
    if (match) {
      maxNum = parseInt(match[1], 10);
    }
  }

  const nextNum = maxNum + 1;
  // Pad the number with leading zeros so it is at least 3 digits (e.g. 001, 002... 010... 100...)
  const paddedNum = String(nextNum).padStart(3, "0");
  return `EMP${paddedNum}`;
}

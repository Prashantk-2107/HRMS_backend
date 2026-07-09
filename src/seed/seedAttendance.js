import "dotenv/config";
import prisma from "../config/db.js";

/**
 * Seeder to generate mock attendance logs for employees for the last 20 days.
 */
async function main() {
  console.log("Seeding mock attendance data...");

  // Fetch all employees (excluding admin and super_admin roles)
  const employees = await prisma.employee.findMany({
    include: {
      role: true,
    },
  });

  const targetEmployees = employees.filter((emp) => {
    const roleName = emp.role?.name?.toLowerCase().replace(/[\s_-]/g, "");
    return roleName !== "superadmin" && roleName !== "admin";
  });

  if (targetEmployees.length === 0) {
    console.log("No employees found to seed attendance for. Please run seedEmployes.js first.");
    return;
  }

  // Generate logs for the last 20 calendar days
  const today = new Date();
  const logsToCreate = [];

  for (let i = 20; i >= 0; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - i);

    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const attendanceDate = new Date(dateStr);

    for (const emp of targetEmployees) {
      // 1. Roll a random status chance
      // - 75% Present (On-time)
      // - 15% Present (Late)
      // - 5% Half Day
      // - 5% Absent
      const roll = Math.random() * 100;

      let status = "present";
      let check_in = null;
      let check_out = null;
      let working_hours = null;

      if (roll < 75) {
        // Present (On-time check-in)
        // Check-in: 09:00 AM - 09:30 AM
        const checkInHour = 9;
        const checkInMin = Math.floor(Math.random() * 30);
        check_in = new Date(`${dateStr}T0${checkInHour}:${String(checkInMin).padStart(2, "0")}:00`);

        // Check-out: 06:00 PM - 06:30 PM (18:00 - 18:30)
        const checkOutHour = 18;
        const checkOutMin = Math.floor(Math.random() * 30);
        check_out = new Date(`${dateStr}T${checkOutHour}:${String(checkOutMin).padStart(2, "0")}:00`);
      } else if (roll < 90) {
        // Late Check-in
        // Check-in: 09:45 AM - 10:15 AM
        const checkInHour = Math.random() < 0.5 ? 9 : 10;
        const checkInMin = checkInHour === 9 ? 45 + Math.floor(Math.random() * 15) : Math.floor(Math.random() * 15);
        check_in = new Date(`${dateStr}T${String(checkInHour).padStart(2, "0")}:${String(checkInMin).padStart(2, "0")}:00`);

        // Check-out: 06:00 PM
        check_out = new Date(`${dateStr}T18:00:00`);
      } else if (roll < 95) {
        // Half Day
        // Check-in: 09:00 AM, Check-out: 01:00 PM (13:00)
        check_in = new Date(`${dateStr}T09:00:00`);
        check_out = new Date(`${dateStr}T13:00:00`);
        status = "half_day";
      } else {
        // Absent
        status = "absent";
      }

      // Calculate working hours if both exist
      if (check_in && check_out) {
        const diffMs = check_out - check_in;
        const diffHours = diffMs / (1000 * 60 * 60);
        working_hours = parseFloat(diffHours.toFixed(2));
      }

      // Upsert to prevent duplicate conflicts if run multiple times
      logsToCreate.push(
        prisma.attendance.upsert({
          where: {
            emp_id_attendance_date: {
              emp_id: emp.emp_id,
              attendance_date: attendanceDate,
            },
          },
          update: {
            check_in,
            check_out,
            working_hours,
            status,
          },
          create: {
            emp_id: emp.emp_id,
            attendance_date: attendanceDate,
            check_in,
            check_out,
            working_hours,
            status,
          },
        })
      );
    }
  }

  // Execute all operations in a transaction batch
  await prisma.$transaction(logsToCreate);
  console.log(`Successfully seeded ${logsToCreate.length} attendance logs.`);
}

main()
  .catch((e) => {
    console.error("Error seeding attendance:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding Super Admin...");

  // Find or create Super_admin role
  let superAdminRole = await prisma.role.findUnique({
    where: { name: "Super_admin" },
  });

  if (!superAdminRole) {
    console.log("Super_admin role not found. Creating it first...");
    superAdminRole = await prisma.role.create({
      data: {
        name: "Super_admin",
        description:
          "Full system access and control over all settings and permissions.",
      },
    });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminData = {
    empCode: "EMP001",
    first_name: "Super",
    last_name: "Admin",
    email: adminEmail,
    address: "HQ Office, New Delhi",
    phone_number: "9876543210",
    joining_date: new Date(),
    employment_type: "permanent",
    gender: "male",
    employee_status: "active",
    password: hashedPassword,
    is_email_verified: true,
    role_id: superAdminRole.role_id,
  };

  const upsertedAdmin = await prisma.employee.upsert({
    where: { email: adminData.email },
    update: {
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      empCode: adminData.empCode,
      address: adminData.address,
      phone_number: adminData.phone_number,
      joining_date: adminData.joining_date,
      employment_type: adminData.employment_type,
      gender: adminData.gender,
      employee_status: adminData.employee_status,
      role_id: adminData.role_id,
      password: adminData.password,
    },
    create: adminData,
  });

  console.log(`Super Admin seeded successfully:`);
  console.log(`- Email: ${upsertedAdmin.email}`);
  console.log(`- Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error("Error seeding Super Admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

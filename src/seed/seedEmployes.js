import "dotenv/config";
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding mock employees...");

  // Get or create roles to ensure they exist
  const rolesNeeded = [
    "Human Resource",
    "Project_manager",
    "Developer",
    "Accountant",
    "UI/UX",
    "Quality Analyst",
    "SEO"
  ];
  const roleMap = {};

  for (const roleName of rolesNeeded) {
    let role = await prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      console.log(`Role "${roleName}" not found. Creating it first...`);
      role = await prisma.role.create({
        data: {
          name: roleName,
          description: `Responsible for ${roleName.toLowerCase()} tasks.`,
        },
      });
    }
    roleMap[roleName] = role.role_id;
  }

  const firstNames = [
    "Aarav", "Ananya", "Vihaan", "Diya", "Reyansh",
    "Sanya", "Kabir", "Meera", "Arjun", "Ira",
    "Rohan", "Riya", "Aditya", "Tara", "Ishaan",
    "Kavya", "Dev", "Zara", "Krishna", "Kiara",
    "Siddharth", "Avani", "Aryan", "Nisha", "Rahul",
    "Neha", "Amit", "Pooja", "Vikram", "Sneha"
  ];

  const lastNames = [
    "Sharma", "Verma", "Gupta", "Mehta", "Sen",
    "Joshi", "Kapoor", "Roy", "Bose", "Das",
    "Nair", "Pillai", "Reddy", "Rao", "Patel",
    "Shah", "Singh", "Kaur", "Chawla", "Malhotra",
    "Chatterjee", "Mukherjee", "Banerjee", "Bahl", "Mishra",
    "Trivedi", "Pandey", "Dubey", "Saxena", "Deshmukh"
  ];

  const otherRoles = ["Developer", "Accountant", "UI/UX", "Quality Analyst", "SEO"];
  const hashedPassword = await bcrypt.hash("Password@123", 10);

  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const empCode = `EMP${String(i + 2).padStart(3, "0")}`; // Starting from EMP002 since EMP001 is Super Admin
    const phoneNumber = `9876543${String(i + 10).padStart(3, "0")}`;
    const emergencyNumber = `9111111${String(i + 10).padStart(3, "0")}`;

    let roleName;
    if (i === 0) {
      roleName = "Human Resource";
    } else if (i === 1) {
      roleName = "Project_manager";
    } else {
      roleName = otherRoles[(i - 2) % otherRoles.length];
    }
    const roleId = roleMap[roleName];

    const employeeData = {
      empCode,
      first_name: firstName,
      last_name: lastName,
      email,
      address: `Flat No. ${100 + i}, Sector 62, Noida, UP`,
      phone_number: phoneNumber,
      date_of_birth: new Date(1990 + (i % 10), i % 12, (i % 28) + 1),
      joining_date: new Date(2025, i % 12, (i % 28) + 1),
      employment_type: i % 5 === 0 ? "intern" : "permanent",
      gender: i % 2 === 0 ? "male" : "female",
      employee_status: "active",
      emergency_contact_name: `Parent of ${firstName}`,
      emergency_contact_number: emergencyNumber,
      password: hashedPassword,
      is_email_verified: true,
      role_id: roleId,
    };

    const upsertedEmployee = await prisma.employee.upsert({
      where: { email },
      update: {
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        empCode: employeeData.empCode,
        address: employeeData.address,
        phone_number: employeeData.phone_number,
        date_of_birth: employeeData.date_of_birth,
        joining_date: employeeData.joining_date,
        employment_type: employeeData.employment_type,
        gender: employeeData.gender,
        employee_status: employeeData.employee_status,
        emergency_contact_name: employeeData.emergency_contact_name,
        emergency_contact_number: employeeData.emergency_contact_number,
        role_id: employeeData.role_id,
        password: employeeData.password,
      },
      create: employeeData,
    });

    console.log(`Upserted employee ${i + 1}/30: ${upsertedEmployee.first_name} ${upsertedEmployee.last_name} (${roleName})`);
  }

  console.log("Mock employees seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding employees:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

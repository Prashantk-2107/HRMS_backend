import "dotenv/config";
import prisma from "../config/db.js";

async function main() {
  console.log("Seeding roles...");

  const roles = [
    {
      name: "Human Resource",
      description:
        "Responsible for managing employee relations, hiring, and company policies.",
    },
    {
      name: "Super_admin",
      description:
        "Full system access and control over all settings and permissions.",
    },
    {
      name: "Project_manager",
      description:
        "Responsible for overseeing projects, assignments, and team management.",
    },
    {
      name: "Developer",
      description:
        "Responsible for system development, coding, and technical tasks.",
    },
    {
      name: "Accountant",
      description:
        "Responsible for managing company accounts, payroll, and financial records.",
    },
    {
      name: "UI/UX",
      description:
        "Responsible for managing user interface and user experience design.",
    },
    {
      name: "Quality Analyst",
      description:
        "Responsible for ensuring the quality of software and applications.",
    },
    {
      name: "SEO",
      description:
        "Responsible for optimizing websites for search engines.",
    },
    {
      name: "Marketing",
      description:
        "Responsible for marketing activities and campaigns.",
    },
    {
      name: "Business Analyst",
      description:
        "Responsible for business analysis activities and campaigns.",
    }
  ];

  for (const role of roles) {
    const upsertedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });
    console.log(`Upserted role: ${upsertedRole.name}`);
  }

  console.log("Roles seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

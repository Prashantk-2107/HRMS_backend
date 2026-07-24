import "dotenv/config";
import prisma from "../config/db.js";

async function main() {
  console.log("Seeding permissions...");

  const permissions = [
    { name: "emp:get_all" },
    { name: "emp:create" },
    { name: "emp:delete" },
    { name: "emp:update" },
    { name: "emp:assign_role" },
    { name: "emp:view_any" },
    { name: "emp:view_documents" },
    { name: "emp:add_documents" },
    { name: "emp:remove_documents" },
    { name: "emp:verify_documents" },
    { name: "emp:manage_bank_details" },
    { name: "role:create" },
    { name: "role:get_all" },
    { name: "role:delete" },
    { name: "role:update" },
    { name: "emp:grant_extra_permission" },
    { name: "holiday:manage" },
    { name: "permission:grantAndRevoke" },
    { name: "leave:view_pending" },
    { name: "leave:approve" },
    { name: "leave:reject" },
    { name: "attendance:view_pending" },
    { name: "attendance:approve" },
    { name: "attendance:reject" },
    { name: "attendance:view_today_dashboard" },
    { name: "attendance:view_monthly_report" },
    { name: "attendance:view_analytics" },
    { name: "project:create" },
    { name: "project:view_all" },
    { name: "project:view" },
    { name: "project:update" },
    { name: "project:delete" },
    { name: "project:manage_members" },
  ];

  for (const permission of permissions) {
    const upsertedPermission = await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: {
        name: permission.name,
      },
    });
    console.log(`Upserted permission: ${upsertedPermission.name}`);
  }

  console.log("Permissions seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding permissions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import prisma from "../config/db.js";

async function main() {
  console.log("Seeding Role-Permission associations...");

  // Load existing roles and permissions
  const allRoles = await prisma.role.findMany();
  const allPermissions = await prisma.permission.findMany();

  // Normalize helper to handle spaces, underscores, hyphens, and case-insensitivity
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const findRole = (name) => {
    const target = normalize(name);
    return allRoles.find((r) => normalize(r.name) === target);
  };

  const findPermission = (name) => {
    const target = normalize(name);
    return allPermissions.find((p) => normalize(p.name) === target);
  };

  const allRolesList = ["super_admin", "Human Resource", "Project_manager", "Developer", "Accountant", "UI/UX", "Quality Analyst", "SEO", "Marketing", "Business Analyst"];
  const managementRoles = ["super_admin", "Human Resource", "Project_manager"];
  const hrAndAdmin = ["super_admin", "Human Resource"];

  const mappings = [
    {
      permissionName: "emp:get_all",
      roles: allRolesList, // All employees can view company directory
    },
    {
      permissionName: "emp:create",
      roles: hrAndAdmin,
    },
    {
      permissionName: "emp:delete",
      roles: hrAndAdmin,
    },
    {
      permissionName: "emp:update",
      roles: hrAndAdmin,
    },
    {
      permissionName: "role:create",
      roles: ["super_admin"],
    },
    {
      permissionName: "role:get_all",
      roles: hrAndAdmin,
    },
    {
      permissionName: "role:delete",
      roles: ["super_admin"],
    },
    {
      permissionName: "role:update",
      roles: ["super_admin"],
    },
    {
      permissionName: "emp:assign_role",
      roles: managementRoles,
    },
    {
      permissionName: "emp:view_any",
      roles: allRolesList, // All employees can view basic profile of other colleagues
    },
    {
      permissionName: "emp:view_documents",
      roles: managementRoles,
    },
    {
      permissionName: "emp:add_documents",
      roles: hrAndAdmin,
    },
    {
      permissionName: "emp:remove_documents",
      roles: hrAndAdmin,
    },
    {
      permissionName: "emp:verify_documents",
      roles: hrAndAdmin,
    },
    {
      permissionName: "emp:manage_bank_details",
      roles: ["super_admin", "Human Resource", "Accountant"], // Accountants can manage bank details for payroll
    },
    {
      permissionName: "holiday:manage",
      roles: managementRoles,
    },
    {
      permissionName: "permission:grantAndRevoke",
      roles: ["super_admin"],
    },
    {
      permissionName: "leave:view_pending",
      roles: managementRoles,
    },
    {
      permissionName: "leave:approve",
      roles: managementRoles,
    },
    {
      permissionName: "leave:reject",
      roles: managementRoles,
    },
    {
      permissionName: "attendance:view_pending",
      roles: managementRoles,
    },
    {
      permissionName: "attendance:approve",
      roles: managementRoles,
    },
    {
      permissionName: "attendance:reject",
      roles: managementRoles,
    },
    {
      permissionName: "attendance:view_today_dashboard",
      roles: managementRoles,
    },
    {
      permissionName: "attendance:view_monthly_report",
      roles: managementRoles,
    },
    {
      permissionName: "attendance:view_analytics",
      roles: managementRoles,
    },
  ];

  for (const mapping of mappings) {
    const permission = findPermission(mapping.permissionName);
    if (!permission) {
      console.warn(
        `Permission "${mapping.permissionName}" not found in database. Skipping.`,
      );
      continue;
    }

    for (const roleName of mapping.roles) {
      const role = findRole(roleName);
      if (!role) {
        console.warn(`Role "${roleName}" not found in database. Skipping.`);
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: role.role_id,
            permission_id: permission.permission_id,
          },
        },
        update: {},
        create: {
          role_id: role.role_id,
          permission_id: permission.permission_id,
        },
      });

      console.log(
        `Associated permission "${permission.name}" with role "${role.name}"`,
      );
    }
  }

  console.log("Role-Permission associations seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding role-permission associations:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

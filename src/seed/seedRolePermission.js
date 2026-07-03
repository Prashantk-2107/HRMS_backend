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

  const mappings = [
    {
      permissionName: "emp:get_all",
      roles: ["Human_resource", "super_admin", "Project_manager"],
    },
    {
      permissionName: "emp:create",
      roles: ["super_admin", "Human_resource"],
    },
    {
      permissionName: "emp:delete",
      roles: ["super_admin", "Human_resource"],
    },
    {
      permissionName: "emp:update",
      roles: ["super_admin", "Human_resource"],
    },
    {
      permissionName: "role:create",
      roles: ["super_admin"],
    },
    {
      permissionName: "role:get_all",
      roles: ["Human_resource", "super_admin"],
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
      roles: ["super_admin", "Human_resource", "Project_manager"],
    },
    {
      permissionName: "emp:view_any",
      roles: ["super_admin", "Human_resource", "Project_manager"],
    },
    {
      permissionName: "emp:view_documents",
      roles: ["Human_resource", "super_admin", "Project_manager"],
    },
    {
      permissionName: "emp:add_documents",
      roles: ["Human_resource", "super_admin"],
    },
    {
      permissionName: "emp:remove_documents",
      roles: ["Human_resource", "super_admin"],
    },
    {
      permissionName: "emp:verify_documents",
      roles: ["Human_resource", "super_admin"],
    },
    {
      permissionName: "emp:manage_bank_details",
      roles: ["Human_resource", "super_admin"],
    },
    {
      permissionName: "holiday:manage",
      roles: ["super_admin", "Human_resource", "Project_manager"],
    },
    {
      permissionName: "permission:grantAndRevoke",
      roles: ["super_admin"],
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

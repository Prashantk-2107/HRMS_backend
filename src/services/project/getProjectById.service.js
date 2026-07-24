import prisma from "../../config/db.js";

/**
 * Service to fetch a single project by ID with creator, member details, and project roles.
 */
export const getProjectByIdService = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: {
      project_id: projectId,
    },
    include: {
      creator: {
        select: {
          emp_id: true,
          empCode: true,
          first_name: true,
          last_name: true,
          email: true,
          profile_image: true,
        },
      },
      members: {
        include: {
          employee: {
            select: {
              emp_id: true,
              empCode: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
              profile_image: true,
              employee_status: true,
              employment_type: true,
            },
          },
          projectRole: {
            select: {
              id: true,
              role_name: true,
            },
          },
        },
        orderBy: {
          joined_at: "asc",
        },
      },
    },
  });

  return project;
};

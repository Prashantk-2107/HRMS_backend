import prisma from "../../config/db.js";
import { Pagination } from "../../utils/Pagination.js";

/**
 * Service to retrieve projects with search, status filtering, and pagination.
 */
export const getAllProjectsService = async ({ page, limit, search, status } = {}) => {
  const where = {};

  // Apply status filter if provided
  if (status && status.trim() !== "") {
    where.status = status.trim();
  }

  // Apply search query across project_name and description
  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { project_name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const queryOptions = {
    where,
    include: {
      creator: {
        select: {
          emp_id: true,
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
              first_name: true,
              last_name: true,
              email: true,
              profile_image: true,
            },
          },
          projectRole: {
            select: {
              id: true,
              role_name: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  };

  // If page or limit is specified, apply pagination
  if (page !== undefined || limit !== undefined) {
    const pagination = new Pagination(page, limit);
    const { data: projects, pagination: meta } = await pagination.paginate(
      prisma.project,
      queryOptions
    );

    return { projects, pagination: meta };
  }

  // Fallback to fetching all matching projects
  const projects = await prisma.project.findMany(queryOptions);
  return { projects, totalItems: projects.length };
};

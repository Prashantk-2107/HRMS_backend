import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Service to create a new project with optional members.
 */
export const createProjectService = async (projectData, creatorEmpId) => {
  const {
    project_name,
    status = "planning",
    description,
    start_date,
    end_date,
    members = [],
  } = projectData;

  // Verify creator exists
  const creatorExists = await prisma.employee.findUnique({
    where: { emp_id: creatorEmpId },
  });

  if (!creatorExists) {
    throw new ApiError(404, "Creator employee not found");
  }

  // Deduplicate and filter member list
  const memberMap = new Map();
  
  // Ensure creator is included as a member by default if not specified
  memberMap.set(creatorEmpId, {
    employee_id: creatorEmpId,
    project_role_id: null,
  });

  for (const m of members) {
    memberMap.set(m.employee_id, {
      employee_id: m.employee_id,
      project_role_id: m.project_role_id || null,
    });
  }

  const uniqueMembers = Array.from(memberMap.values());

  // Verify all specified employees exist
  const employeeIds = uniqueMembers.map((m) => m.employee_id);
  const foundEmployees = await prisma.employee.findMany({
    where: { emp_id: { in: employeeIds } },
    select: { emp_id: true },
  });

  if (foundEmployees.length !== employeeIds.length) {
    throw new ApiError(400, "One or more specified member employees do not exist");
  }

  // Create Project along with initial members in a single transaction
  const newProject = await prisma.project.create({
    data: {
      project_name,
      status,
      description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      created_by: creatorEmpId,
      members: {
        create: uniqueMembers.map((m) => ({
          employee_id: m.employee_id,
          project_role_id: m.project_role_id,
        })),
      },
    },
    include: {
      creator: {
        select: {
          emp_id: true,
          first_name: true,
          last_name: true,
          email: true,
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
          projectRole: true,
        },
      },
    },
  });

  return newProject;
};

import prisma from "../../config/db.js";

/**
 * Service to search and filter employees from the database.
 * Supports keyword search, specific field filters, date range filters, pagination, and sorting.
 */
async function searchEmployeesService({
  query,
  emp_id,
  empCode,
  first_name,
  last_name,
  email,
  phone_number,
  employment_type,
  gender,
  employee_status,
  role_id,
  role_name,
  joining_date_from,
  joining_date_to,
  page = 1,
  limit = 10,
  sortBy = "created_at",
  sortOrder = "desc",
}) {
  try {
    const where = {};

    // 1. General search query (fuzzy search across multiple text fields)
    if (query && query.trim() !== "") {
      const searchStr = query.trim();
      const searchConditions = [
        { first_name: { contains: searchStr, mode: "insensitive" } },
        { last_name: { contains: searchStr, mode: "insensitive" } },
        { email: { contains: searchStr, mode: "insensitive" } },
        { empCode: { contains: searchStr, mode: "insensitive" } },
        { phone_number: { contains: searchStr, mode: "insensitive" } },
      ];

      // If search query has a space, try checking first name + last name combination
      if (searchStr.includes(" ")) {
        const parts = searchStr.split(/\s+/);
        if (parts.length >= 2) {
          searchConditions.push({
            AND: [
              { first_name: { contains: parts[0], mode: "insensitive" } },
              { last_name: { contains: parts[parts.length - 1], mode: "insensitive" } },
            ],
          });
        }
      }

      where.OR = searchConditions;
    }

    // 2. Field-specific precise or partial filters
    if (emp_id && emp_id.trim() !== "") {
      where.emp_id = emp_id.trim();
    }

    if (empCode && empCode.trim() !== "") {
      where.empCode = { contains: empCode.trim(), mode: "insensitive" };
    }

    if (first_name && first_name.trim() !== "") {
      where.first_name = { contains: first_name.trim(), mode: "insensitive" };
    }

    if (last_name && last_name.trim() !== "") {
      where.last_name = { contains: last_name.trim(), mode: "insensitive" };
    }

    if (email && email.trim() !== "") {
      where.email = { contains: email.trim(), mode: "insensitive" };
    }

    if (phone_number && phone_number.trim() !== "") {
      where.phone_number = { contains: phone_number.trim(), mode: "insensitive" };
    }

    if (employment_type && employment_type.trim() !== "") {
      where.employment_type = employment_type.trim();
    }

    if (gender && gender.trim() !== "") {
      where.gender = gender.trim();
    }

    if (employee_status && employee_status.trim() !== "") {
      where.employee_status = employee_status.trim();
    }

    if (role_id && role_id.trim() !== "") {
      where.role_id = role_id.trim();
    }

    if (role_name && role_name.trim() !== "") {
      where.role = {
        name: { contains: role_name.trim(), mode: "insensitive" },
      };
    }

    // Date range filters for joining_date
    if (joining_date_from || joining_date_to) {
      where.joining_date = {};
      if (joining_date_from) {
        where.joining_date.gte = new Date(joining_date_from);
      }
      if (joining_date_to) {
        where.joining_date.lte = new Date(joining_date_to);
      }
    }

    // Pagination configuration
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Sorting configuration
    const allowedSortFields = [
      "emp_id",
      "empCode",
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "date_of_birth",
      "joining_date",
      "employment_type",
      "gender",
      "employee_status",
      "created_at",
      "updated_at",
    ];

    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
    const finalSortOrder = ["asc", "desc"].includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : "desc";

    // Query both matching records and total count
    const [totalCount, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        select: {
          emp_id: true,
          empCode: true,
          first_name: true,
          last_name: true,
          email: true,
          profile_image: true,
          address: true,
          phone_number: true,
          date_of_birth: true,
          joining_date: true,
          employment_type: true,
          gender: true,
          employee_status: true,
          emergency_contact_name: true,
          emergency_contact_number: true,
          created_at: true,
          updated_at: true,
          role: {
            select: {
              role_id: true,
              name: true,
            },
          },
        },
        orderBy: {
          [finalSortBy]: finalSortOrder,
        },
        skip,
        take: parsedLimit,
      }),
    ]);

    return {
      totalCount,
      employees,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(totalCount / parsedLimit),
    };
  } catch (error) {
    throw error;
  }
}

export { searchEmployeesService };

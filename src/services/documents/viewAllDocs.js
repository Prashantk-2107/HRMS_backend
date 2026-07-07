
import prisma from "../../config/db.js";
import { Pagination } from "../../utils/Pagination.js";

/**
 * Service to retrieve all employee documents.
 * Accessible only by Super admin, HR, and Project manager.
 * Supports optional filters and server-side pagination.
 * @returns {Promise<Object>} Paginated employee documents with their metadata.
 */
async function viewAllDocsService({ page, limit, search, status, type } = {}) {
  const where = {};

  if (status && status !== "all") {
    where.verification_status = status;
  }

  if (type && type !== "all") {
    where.document_type = type;
  }

  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { document_number: { contains: q, mode: "insensitive" } },
      { document_name: { contains: q, mode: "insensitive" } },
      { document_type: { contains: q, mode: "insensitive" } },
      {
        employee: {
          OR: [
            { first_name: { contains: q, mode: "insensitive" } },
            { last_name: { contains: q, mode: "insensitive" } },
            { empCode: { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const pPage = page ? parseInt(page, 10) : 1;
  const pLimit = limit ? parseInt(limit, 10) : 10;
  const pagination = new Pagination(pPage, pLimit);

  const { data: documents, pagination: meta } = await pagination.paginate(
    prisma.employeeDocument,
    {
      where,
      include: {
        employee: {
          select: {
            emp_id: true,
            first_name: true,
            last_name: true,
            email: true,
            empCode: true,
          },
        },
        uploader: {
          select: {
            emp_id: true,
            first_name: true,
            last_name: true,
          },
        },
        verifier: {
          select: {
            emp_id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    }
  );

  return { documents, pagination: meta };
}

export { viewAllDocsService };

import prisma from "../../config/db.js";

/**
 * Service to retrieve all employee documents.
 * Accessible only by Super admin, HR, and Project manager.
 * @returns {Promise<Array>} List of all employee documents with their employee info.
 */
async function viewAllDocsService() {
  const documents = await prisma.employeeDocument.findMany({
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
  });

  return documents;
}

export { viewAllDocsService };

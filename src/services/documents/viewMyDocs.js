import prisma from "../../config/db.js";

/**
 * Service to retrieve all documents belonging to a specific employee.
 * @param {string} emp_id - The ID of the employee whose documents are to be retrieved.
 * @returns {Promise<Array>} List of employee document records.
 */
async function viewMyDocsService(emp_id) {
  if (!emp_id) {
    throw new Error("Employee ID is required");
  }

  const allDocs = await prisma.employeeDocument.findMany({
    where: {
      emp_id: emp_id,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const latestDocsMap = new Map();
  for (const doc of allDocs) {
    if (!latestDocsMap.has(doc.document_type)) {
      latestDocsMap.set(doc.document_type, doc);
    }
  }

  return Array.from(latestDocsMap.values());
}

export { viewMyDocsService };

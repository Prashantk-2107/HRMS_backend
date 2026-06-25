import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { viewMyDocsService } from "../../services/documents/viewMyDocs.js";

/**
 * Controller to handle retrieving the authenticated employee's own documents.
 * Delegates database retrieval to the service layer.
 */
const viewMyDocs = asyncHandler(async (req, res) => {
    const emp_id = req.employee.emp_id;

    const documents = await viewMyDocsService(emp_id);

    return res.status(200).json(
        new ApiResponse(200, "Documents retrieved successfully", {
            documents,
        }),
    );
});

export { viewMyDocs };

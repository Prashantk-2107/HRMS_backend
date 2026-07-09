import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createLeaveSchema } from "../../validations/leave.validation.js";
import { createLeaveRequestService } from "../../services/leave/createRequest.js";

/**
 * Controller to handle employee submitting a leave request.
 */
const createRequest = asyncHandler(async (req, res) => {
  // Validate request body
  const parsed = createLeaveSchema.parse(req.body);

  const request = await createLeaveRequestService({
    emp_id: req.employee.emp_id,
    start_date: parsed.start_date,
    end_date: parsed.end_date,
    leave_type: parsed.leave_type,
    reason: parsed.reason,
  });

  return res.status(201).json(
    new ApiResponse(201, "Leave request submitted successfully", {
      request,
    })
  );
});

export { createRequest };

import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateApproval(req, res, next) {
  const { action, edited_text } = req.body;

  if (req.path.includes('/resolve') || req.path.includes('/approve') || req.path.includes('/reject')) {
    if (action && !['APPROVED', 'EDITED', 'REJECTED'].includes(action)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Action must be APPROVED, EDITED, or REJECTED.'),
      );
    }
    if (action === 'EDITED' && (!edited_text || !edited_text.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Edited text is required when action is EDITED.'),
      );
    }
  }

  next();
}

export default validateApproval;

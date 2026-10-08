import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateCannedResponse(req, res, next) {
  const { shortcut, title, body } = req.body;

  if (req.method === 'POST') {
    if (!shortcut || typeof shortcut !== 'string' || !shortcut.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Shortcut is required and must be a non-empty string.'),
      );
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Title is required and must be a non-empty string.'),
      );
    }
    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Body is required and must be a non-empty string.'),
      );
    }
  }

  next();
}

export default validateCannedResponse;

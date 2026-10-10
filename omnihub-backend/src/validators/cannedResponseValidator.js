import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateCannedResponse(req, res, next) {
  const { shortcut, title, body, content } = req.body;
  const textBody = body || content;

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
    if (!textBody || typeof textBody !== 'string' || !textBody.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Body is required and must be a non-empty string.'),
      );
    }
    req.body.body = textBody.trim();
  } else if (content && !body) {
    req.body.body = content;
  }

  next();
}

export default validateCannedResponse;

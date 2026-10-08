import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateTemplate(req, res, next) {
  const { name, body, category } = req.body;

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Template name is required.'),
      );
    }
    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Template body is required.'),
      );
    }
    if (category && !['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(category)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Category must be MARKETING, UTILITY, or AUTHENTICATION.'),
      );
    }
  }

  next();
}

export default validateTemplate;

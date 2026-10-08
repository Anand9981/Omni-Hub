import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateAIContext(req, res, next) {
  const { business_name, tone, forbidden_topics } = req.body;

  if (tone && !['Professional', 'Friendly', 'Casual', 'Formal', 'Technical'].includes(tone)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Tone must be one of: Professional, Friendly, Casual, Formal, Technical.'),
    );
  }

  if (forbidden_topics && !Array.isArray(forbidden_topics)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Forbidden topics must be an array of strings.'),
    );
  }

  next();
}

export default validateAIContext;

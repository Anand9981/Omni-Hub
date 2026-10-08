import { AIContext } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export async function contentFilter(req, res, next) {
  const text = req.body.text_content || req.body.text || req.body.proposed_text || '';
  if (!text) return next();

  try {
    const aiContext = await AIContext.findOne();
    const forbidden = aiContext?.forbidden_topics || ['unauthorized discounts', 'internal credentials'];

    const lower = text.toLowerCase();
    for (const topic of forbidden) {
      if (lower.includes(topic.toLowerCase())) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, `Content violates safety policy regarding: "${topic}"`),
        );
      }
    }
    next();
  } catch (err) {
    next();
  }
}

export default contentFilter;

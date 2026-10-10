import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateMessage(req, res, next) {
  const { conversation_id, text, text_content } = req.body;
  const messageText = text || text_content;

  if (req.method === 'POST') {
    if (!conversation_id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Conversation ID is required.'),
      );
    }
    if (!messageText || typeof messageText !== 'string' || !messageText.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, null, 'Message text content cannot be empty.'),
      );
    }
  }

  next();
}

export default validateMessage;

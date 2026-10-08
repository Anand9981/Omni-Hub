import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export function validateWidget(req, res, next) {
  const { primary_color, position } = req.body;

  if (position && !['bottom-right', 'bottom-left'].includes(position)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Position must be either "bottom-right" or "bottom-left".'),
    );
  }

  if (primary_color && typeof primary_color !== 'string') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Primary color must be a valid string.'),
    );
  }

  next();
}

export default validateWidget;

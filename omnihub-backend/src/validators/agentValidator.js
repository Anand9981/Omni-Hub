import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS, ROLES } from '../utils/constants.js';

export function validateAgent(req, res, next) {
  const { role, status } = req.body;

  if (role && !Object.values(ROLES).includes(role)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`),
    );
  }

  if (status && !['active', 'suspended', 'offline', 'away'].includes(status)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Status must be active, suspended, offline, or away.'),
    );
  }

  next();
}

export default validateAgent;

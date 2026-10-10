import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS, ROLES } from '../utils/constants.js';

const ALLOWED_ROLES = [
  ...Object.values(ROLES),
  'Super Admin',
  'Admin',
  'Agent',
  'Viewer',
  'super_admin',
  'admin',
  'agent',
  'viewer',
];

export function validateAgent(req, res, next) {
  const { role, status } = req.body;

  if (role && !ALLOWED_ROLES.includes(role)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, `Invalid role: ${role}`),
    );
  }

  if (status && !['active', 'suspended', 'offline', 'away', 'online', 'busy'].includes(status)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Status must be online, away, busy, offline, active, or suspended.'),
    );
  }

  next();
}

export default validateAgent;

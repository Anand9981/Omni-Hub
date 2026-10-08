import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS, ROLES } from '../utils/constants.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        formatResponse(false, null, 'You do not have permission to perform this action.'),
      );
    }
    next();
  };
}

export function requireAdmin(req, res, next) {
  return authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN)(req, res, next);
}

export function requireSuperAdmin(req, res, next) {
  return authorize(ROLES.SUPER_ADMIN)(req, res, next);
}

export function checkNotReadOnly(req, res, next) {
  if (req.user && req.user.role === ROLES.VIEWER) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatResponse(false, null, 'Viewer accounts have read-only access.'),
    );
  }
  next();
}

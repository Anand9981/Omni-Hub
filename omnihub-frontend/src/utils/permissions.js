export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  AGENT: 'Agent',
  VIEWER: 'Viewer',
};

export function canManageApprovals(role) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

export function isReadOnly(role) {
  return role === ROLES.VIEWER;
}

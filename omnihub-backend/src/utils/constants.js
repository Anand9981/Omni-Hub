export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  AGENT: 'Agent',
  VIEWER: 'Viewer',
};

export const PLATFORMS = {
  TELEGRAM: 'telegram',
  DISCORD: 'discord',
  WHATSAPP: 'whatsapp',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  WEBCHAT: 'webchat',
};

export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  BUTTON_CLICK: 'BUTTON_CLICK',
  MEDIA: 'MEDIA',
  VOICE: 'VOICE',
};

export const MESSAGE_DIRECTIONS = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
};

export const MESSAGE_STATUS = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED',
};

export const APPROVAL_MODES = {
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
};

export const AUTOPILOT_MODES = {
  ON: 'ON',
  OFF: 'OFF',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};


import crypto from 'crypto';

export function formatResponse(success, data = null, message = '', extra = {}) {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

export function generateUUID() {
  return crypto.randomUUID();
}

export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}


/**
 * Sanitizes an object recursively by stripping keys starting with '$' (NoSQL injection prevention)
 * and trimming string values.
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block MongoDB operator injection keys like $gt, $ne, $where
    if (key.startsWith('$')) {
      continue;
    }
    if (typeof value === 'string') {
      // Basic XSS script tag stripping
      clean[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
    } else if (typeof value === 'object') {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export function sanitizeMiddleware(req, _res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

export default sanitizeMiddleware;


export function validateWebhookPayload(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, message: 'Payload must be a valid JSON object.' };
  }
  return { isValid: true };
}

export default validateWebhookPayload;

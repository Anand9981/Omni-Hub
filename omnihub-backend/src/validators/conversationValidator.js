export function validateSendMessage(body) {
  if (!body.text_content && !body.media_url && (!body.buttons || body.buttons.length === 0)) {
    return { isValid: false, message: 'Message must contain text, media, or buttons.' };
  }
  return { isValid: true };
}

export function validateAutoPilotToggle(body) {
  const hasEnabled = typeof body.enabled === 'boolean';
  const hasAutoPilot = typeof body.auto_pilot === 'string' && ['ON', 'OFF'].includes(body.auto_pilot.toUpperCase());
  if (!hasEnabled && !hasAutoPilot) {
    return { isValid: false, message: 'Field "enabled" (boolean) or "auto_pilot" ("ON"/"OFF") is required.' };
  }
  return { isValid: true };
}

export function validateApprovalMode(body) {
  if (!['AUTO', 'MANUAL'].includes(body.approval_mode)) {
    return { isValid: false, message: 'Invalid approval mode. Must be AUTO or MANUAL.' };
  }
  return { isValid: true };
}

export default {
  validateSendMessage,
  validateAutoPilotToggle,
  validateApprovalMode,
};

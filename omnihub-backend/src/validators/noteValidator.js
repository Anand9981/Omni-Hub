export function validateCreateNote(body) {
  const text = body.content || body.text;
  if (!text || !String(text).trim()) {
    return { isValid: false, message: 'Note content cannot be empty.' };
  }
  return { isValid: true };
}

export default validateCreateNote;

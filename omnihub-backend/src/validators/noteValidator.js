export function validateCreateNote(body) {
  if (!body.content || !body.content.trim()) {
    return { isValid: false, message: 'Note content cannot be empty.' };
  }
  return { isValid: true };
}

export default validateCreateNote;

export function validateLeadUpdate(body) {
  if (body.email_address && !/^\S+@\S+\.\S+$/.test(body.email_address)) {
    return { isValid: false, message: 'Please provide a valid email address.' };
  }
  return { isValid: true };
}

export default validateLeadUpdate;

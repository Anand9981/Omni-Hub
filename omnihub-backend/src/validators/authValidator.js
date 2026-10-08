import { validatePasswordStrength } from '../utils/password.js';

export function validateRegister(body) {
  if (!body.name || !body.name.trim()) {
    return { isValid: false, message: 'Name is required.' };
  }
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return { isValid: false, message: 'A valid email address is required.' };
  }
  const passwordValidation = validatePasswordStrength(body.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  return { isValid: true };
}

export function validateLogin(body) {
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }
  if (!body.password) {
    return { isValid: false, message: 'Password is required.' };
  }
  return { isValid: true };
}

export function validateVerifyOTP(body) {
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return { isValid: false, message: 'Email address is required.' };
  }
  if (!body.otp && !body.backupCode) {
    return { isValid: false, message: 'Please provide either a 6-digit OTP code or a backup code.' };
  }
  return { isValid: true };
}

export function validateForgotPassword(body) {
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return { isValid: false, message: 'Please provide a valid email address.' };
  }
  return { isValid: true };
}

export function validateResetPassword(body) {
  if (!body.token) {
    return { isValid: false, message: 'Reset token is missing or invalid.' };
  }
  return validatePasswordStrength(body.newPassword || body.password);
}

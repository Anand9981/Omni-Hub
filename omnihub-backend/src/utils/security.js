import crypto from 'crypto';

const BACKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
}

export function generateBackupCode() {
  const bytes = crypto.randomBytes(10);
  const code = Array.from(bytes, (byte) => BACKUP_CODE_ALPHABET[byte % BACKUP_CODE_ALPHABET.length]).join('');
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

export function generateBackupCodes(count = 10) {
  return Array.from({ length: count }, () => generateBackupCode());
}

export function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

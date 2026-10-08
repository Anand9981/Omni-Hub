import { generateOTP, generateBackupCode, generateBackupCodes, hashString } from '../../../src/utils/security.js';

describe('Security Utility Unit Tests', () => {
  it('should generate numeric OTP of specified length', () => {
    const otp = generateOTP(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('should generate formatted backup codes', () => {
    const code = generateBackupCode();
    expect(code).toBeDefined();
    expect(code.includes('-')).toBe(true);

    const codes = generateBackupCodes(5);
    expect(codes).toHaveLength(5);
  });

  it('should generate sha256 hash of string', () => {
    const hash = hashString('test-string');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).toHaveLength(64);
  });
});

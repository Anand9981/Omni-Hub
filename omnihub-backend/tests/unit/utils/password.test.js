import { hashPassword, comparePassword, validatePasswordStrength } from '../../../src/utils/password.js';

describe('Password Utility Unit Tests', () => {
  it('should hash and verify passwords correctly', async () => {
    const plainPassword = 'Password@123';
    const hash = await hashPassword(plainPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plainPassword);

    const isMatch = await comparePassword(plainPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword@123', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('should validate password strength correctly', () => {
    const weak = validatePasswordStrength('short');
    expect(weak.isValid).toBe(false);

    const strong = validatePasswordStrength('Password@123');
    expect(strong.isValid).toBe(true);
  });
});

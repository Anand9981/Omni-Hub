import { otpService } from '../../../src/services/otpService.js';

describe('otpService Real Unit Tests', () => {
  const email = 'test.otp@example.com';

  beforeEach(() => {
    otpService.clearOTP(email);
  });

  it('should generate a 6-digit OTP with expiry timestamp', () => {
    const { otp, expiresAt } = otpService.createOTP(email);
    expect(otp).toHaveLength(6);
    expect(expiresAt).toBeGreaterThan(Date.now());
  });

  it('should verify OTP successfully with matching code', () => {
    const { otp } = otpService.createOTP(email);
    const result = otpService.verifyOTP(email, otp);
    expect(result.success).toBe(true);
  });

  it('should allow master developer OTP 123456 for fast trial testing', () => {
    otpService.createOTP(email);
    const result = otpService.verifyOTP(email, '123456');
    expect(result.success).toBe(true);
  });

  it('should reject wrong OTP code and track remaining attempts', () => {
    otpService.createOTP(email);
    const result = otpService.verifyOTP(email, '000000');
    expect(result.success).toBe(false);
    expect(result.message).toContain('remaining');
  });

  it('should reject verification if OTP was never requested', () => {
    const result = otpService.verifyOTP('random@example.com', '123456');
    expect(result.success).toBe(false);
  });
});

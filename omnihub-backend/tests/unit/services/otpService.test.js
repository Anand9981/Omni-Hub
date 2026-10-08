import { otpService } from '../../../src/services/otpService.js';

describe('OtpService Unit Tests', () => {
  it('should generate numeric OTP object', async () => {
    expect(otpService).toBeDefined();
    const { otp, expiresAt } = otpService.createOTP('test@example.com');
    expect(otp).toBeDefined();
    expect(typeof otp).toBe('string');
    expect(expiresAt).toBeDefined();
  });
});

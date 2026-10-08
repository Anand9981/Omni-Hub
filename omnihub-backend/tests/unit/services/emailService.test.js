import { emailService } from '../../../src/services/emailService.js';

describe('EmailService Unit Tests', () => {
  it('should simulate sending OTP email', async () => {
    expect(emailService).toBeDefined();
    const result = await emailService.sendOTP('user@example.com', '123456');
    expect(result).toBe(true);
  });
});

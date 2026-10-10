import { emailService } from '../../../src/services/emailService.js';

describe('emailService Real Unit Tests', () => {
  it('should deliver mock OTP email', async () => {
    const sent = await emailService.sendOTP('user@example.com', '654321');
    expect(sent).toBe(true);
  });

  it('should deliver mock password reset email', async () => {
    const sent = await emailService.sendPasswordReset('user@example.com', 'https://omnihub.io/reset?token=xyz');
    expect(sent).toBe(true);
  });

  it('should deliver mock welcome email', async () => {
    const sent = await emailService.sendWelcome('user@example.com', 'New Agent');
    expect(sent).toBe(true);
  });
});

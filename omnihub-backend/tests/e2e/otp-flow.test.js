import request from 'supertest';
import app from '../../src/app.js';

describe('E2E OTP Flow Tests', () => {
  it('should handle resend OTP request validation', async () => {
    const res = await request(app).post('/api/auth/resend-otp').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

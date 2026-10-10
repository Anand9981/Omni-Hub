import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/index.js';

describe('E2E Auth Journey Test', () => {
  const e2eEmail = `e2e-user-${Date.now()}@example.com`;
  const e2ePassword = 'Password@123';
  let accessToken = null;
  let refreshToken = null;
  let activeSessionId = null;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: /e2e-user-/i });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /e2e-user-/i });
    await disconnectDB();
  });

  it('Step 1: System Health Check', async () => {
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.success).toBe(true);
    expect(health.body.data.status).toBe('UP');
  });

  it('Step 2: User Registration Journey', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'E2E Test Admin',
        email: e2eEmail,
        password: e2ePassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(e2eEmail);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.backupCodes).toHaveLength(10);
  });

  it('Step 3: User Login with Credentials and 2FA OTP Verification', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: e2eEmail,
        password: e2ePassword,
        rememberMe: true,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    if (loginRes.body.data?.requires2FA) {
      const otpRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: e2eEmail,
          otp: '123456',
        });

      expect(otpRes.status).toBe(200);
      expect(otpRes.body.success).toBe(true);
      accessToken = otpRes.body.data.token;
      refreshToken = otpRes.body.data.refreshToken;
    } else {
      accessToken = loginRes.body.data.token;
      refreshToken = loginRes.body.data.refreshToken;
    }

    expect(accessToken).toBeDefined();
  });

  it('Step 4: Authenticated Access to User Profile & Workspace', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(e2eEmail);
    expect(res.body.data.role).toBe('Admin');
  });

  it('Step 5: View Active Device Sessions', async () => {
    const res = await request(app)
      .get('/api/auth/sessions')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    activeSessionId = res.body.data[0]._id;
  });

  it('Step 6: Regenerate Emergency 2FA Backup Codes', async () => {
    const res = await request(app)
      .post('/api/auth/2fa/backup-codes/regenerate')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.backup_codes).toHaveLength(10);
  });

  it('Step 7: Token Refresh Flow', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(typeof res.body.data.accessToken).toBe('string');
  });

  it('Step 8: Revoke Specific Session on Logout', async () => {
    const res = await request(app)
      .delete(`/api/auth/sessions/${activeSessionId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

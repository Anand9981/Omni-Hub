import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/models/index.js';

describe('Auth API Real Integration Tests', () => {
  const integrationEmail = `test-int-${Date.now()}@example.com`;
  let authToken = null;
  let refreshToken = null;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: /test-int-/i });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test-int-/i });
    await disconnectDB();
  });

  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });

  it('POST /api/auth/register should fail when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register should successfully register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Integration User',
      email: integrationEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(integrationEmail);

    authToken = res.body.data.token;
    refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/auth/login should authenticate user with valid credentials and return 2FA challenge', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: integrationEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requires2FA).toBe(true);
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: integrationEmail,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return current user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(integrationEmail);
  });

  it('GET /api/auth/me should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/refresh should return new access token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });
});

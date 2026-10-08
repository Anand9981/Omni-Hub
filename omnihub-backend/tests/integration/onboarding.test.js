import request from 'supertest';
import app from '../../src/app.js';

describe('Onboarding API Integration Tests', () => {
  it('GET /api/onboarding should require authentication', async () => {
    const res = await request(app).get('/api/onboarding');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


import request from 'supertest';
import app from '../../src/app.js';

describe('Subscription API Integration Tests', () => {
  it('GET /api/subscription should require authentication', async () => {
    const res = await request(app).get('/api/subscription');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


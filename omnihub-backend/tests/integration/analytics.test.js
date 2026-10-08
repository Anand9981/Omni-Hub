import request from 'supertest';
import app from '../../src/app.js';

describe('Analytics API Integration Tests', () => {
  it('GET /api/analytics should require authentication', async () => {
    const res = await request(app).get('/api/analytics');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


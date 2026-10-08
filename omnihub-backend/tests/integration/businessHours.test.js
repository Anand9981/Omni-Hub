import request from 'supertest';
import app from '../../src/app.js';

describe('BusinessHours API Integration Tests', () => {
  it('GET /api/business-hours should require authentication', async () => {
    const res = await request(app).get('/api/business-hours');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


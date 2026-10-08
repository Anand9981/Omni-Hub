import request from 'supertest';
import app from '../../src/app.js';

describe('Billing API Integration Tests', () => {
  it('GET /api/billing/plans should require authentication', async () => {
    const res = await request(app).get('/api/billing/plans');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


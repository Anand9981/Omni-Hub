import request from 'supertest';
import app from '../../src/app.js';

describe('Lead API Integration Tests', () => {
  it('GET /api/leads should require authentication', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


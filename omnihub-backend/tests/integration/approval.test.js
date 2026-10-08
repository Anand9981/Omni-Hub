import request from 'supertest';
import app from '../../src/app.js';

describe('Approval API Integration Tests', () => {
  it('GET /api/approvals should require authentication', async () => {
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


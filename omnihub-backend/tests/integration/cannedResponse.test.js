import request from 'supertest';
import app from '../../src/app.js';

describe('CannedResponse API Integration Tests', () => {
  it('GET /api/canned-responses should require authentication', async () => {
    const res = await request(app).get('/api/canned-responses');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


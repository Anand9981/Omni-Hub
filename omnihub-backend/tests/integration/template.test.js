import request from 'supertest';
import app from '../../src/app.js';

describe('Template API Integration Tests', () => {
  it('GET /api/templates should require authentication', async () => {
    const res = await request(app).get('/api/templates');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


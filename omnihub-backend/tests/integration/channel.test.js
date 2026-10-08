import request from 'supertest';
import app from '../../src/app.js';

describe('Channel API Integration Tests', () => {
  it('GET /api/channels should require authentication', async () => {
    const res = await request(app).get('/api/channels');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


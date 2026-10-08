import request from 'supertest';
import app from '../../src/app.js';

describe('Agent API Integration Tests', () => {
  it('GET /api/agents should require authentication', async () => {
    const res = await request(app).get('/api/agents');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


import request from 'supertest';
import app from '../../src/app.js';

describe('Conversation API Integration Tests', () => {
  it('GET /api/conversations should require authentication', async () => {
    const res = await request(app).get('/api/conversations');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


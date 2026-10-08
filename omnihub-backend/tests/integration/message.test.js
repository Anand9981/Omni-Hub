import request from 'supertest';
import app from '../../src/app.js';

describe('Message API Integration Tests', () => {
  it('POST /api/messages/send should require authentication', async () => {
    const res = await request(app).post('/api/messages/send').send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


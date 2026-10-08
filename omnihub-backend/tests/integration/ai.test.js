import request from 'supertest';
import app from '../../src/app.js';

describe('AI API Integration Tests', () => {
  it('POST /api/ai/generate should require authentication', async () => {
    const res = await request(app).post('/api/ai/generate').send({ text: 'Hello' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


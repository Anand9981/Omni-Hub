import request from 'supertest';
import app from '../../src/app.js';

describe('AIContext API Integration Tests', () => {
  it('GET /api/ai-context should require authentication', async () => {
    const res = await request(app).get('/api/ai-context');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


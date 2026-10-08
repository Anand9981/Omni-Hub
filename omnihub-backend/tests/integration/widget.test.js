import request from 'supertest';
import app from '../../src/app.js';

describe('Widget API Integration Tests', () => {
  it('PUT /api/widget should require authentication', async () => {
    const res = await request(app).put('/api/widget').send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


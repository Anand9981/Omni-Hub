import request from 'supertest';
import app from '../../src/app.js';

describe('E2E Auth Flow Tests', () => {
  it('should verify health check and reject unauthenticated profile request', async () => {
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.success).toBe(true);

    const me = await request(app).get('/api/auth/me');
    expect(me.status).toBe(401);
  });
});


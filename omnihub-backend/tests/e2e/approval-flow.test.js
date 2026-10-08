import request from 'supertest';
import app from '../../src/app.js';

describe('E2E Approval Flow Tests', () => {
  it('should protect draft approval resolution endpoints', async () => {
    const res = await request(app).post('/api/approvals/dummyId/approve').send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

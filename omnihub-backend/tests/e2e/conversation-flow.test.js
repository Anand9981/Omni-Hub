import request from 'supertest';
import app from '../../src/app.js';

describe('E2E Conversation Flow Tests', () => {
  it('should protect conversation detail endpoints', async () => {
    const res = await request(app).get('/api/conversations/dummyId');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

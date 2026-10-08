import request from 'supertest';
import app from '../../src/app.js';

describe('E2E Dashboard Flow Tests', () => {
  it('should verify operational endpoints protect routes properly', async () => {
    const conversations = await request(app).get('/api/dashboard/conversations');
    expect(conversations.status).toBe(401);

    const approvals = await request(app).get('/api/dashboard/approvals');
    expect(approvals.status).toBe(401);
  });
});


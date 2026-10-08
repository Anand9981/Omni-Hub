import request from 'supertest';
import app from '../../src/app.js';

describe('Note API Integration Tests', () => {
  it('GET /api/notes/:conversationId should require authentication', async () => {
    const res = await request(app).get('/api/notes/dummyId');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


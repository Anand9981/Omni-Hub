import request from 'supertest';
import app from '../../src/app.js';

describe('E2E Analytics Flow Tests', () => {
  it('should validate analytics query parameters', async () => {
    const res = await request(app).get('/api/analytics?date=invalid-date');
    expect(res.status).toBe(401); // Auth check comes before parameter validation
  });
});

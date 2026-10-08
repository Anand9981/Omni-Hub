import request from 'supertest';
import app from '../../src/app.js';

describe('E2E Onboarding Flow Tests', () => {
  it('should protect onboarding checklist updates', async () => {
    const res = await request(app).post('/api/onboarding/checklist').send({ stepKey: 'business_info', value: true });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

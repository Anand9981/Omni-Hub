import request from 'supertest';
import app from '../../src/app.js';

describe('Webhook API Integration Tests', () => {
  it('GET /api/webhooks/whatsapp should respond to verification challenge', async () => {
    const res = await request(app)
      .get('/api/webhooks/whatsapp')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'omnihub_whatsapp_verify_token', 'hub.challenge': '123456' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('123456');
  });
});


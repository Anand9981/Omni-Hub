import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';

describe('Webhook API Real Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/webhooks/whatsapp should respond with challenge on valid token', async () => {
    const res = await request(app)
      .get('/api/webhooks/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'omnihub_whatsapp_verify_token',
        'hub.challenge': 'challenge_123',
      });
    expect(res.status).toBe(200);
    expect(res.text).toBe('challenge_123');
  });

  it('GET /api/webhooks/whatsapp should reject invalid verify token with 403', async () => {
    const res = await request(app)
      .get('/api/webhooks/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_token',
        'hub.challenge': 'challenge_123',
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/webhooks/whatsapp should accept inbound message payload', async () => {
    const res = await request(app)
      .post('/api/webhooks/whatsapp')
      .send({
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  contacts: [{ wa_id: '919999999999', profile: { name: 'Customer' } }],
                  messages: [{ from: '919999999999', type: 'text', text: { body: 'Hello' } }],
                },
              },
            ],
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/webhooks/telegram should accept inbound update', async () => {
    const res = await request(app)
      .post('/api/webhooks/telegram')
      .send({
        update_id: 10001,
        message: {
          chat: { id: 12345 },
          from: { first_name: 'Test', username: 'tester' },
          text: 'Hi via Telegram',
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/webhooks/discord should accept message update', async () => {
    const res = await request(app)
      .post('/api/webhooks/discord')
      .send({
        channel_id: 'chan-001',
        content: 'Hi via Discord',
        author: { username: 'DiscordTester' },
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/webhooks/website should reject payload without chat_id or session_id', async () => {
    const res = await request(app)
      .post('/api/webhooks/website')
      .send({ message: 'Hello without ID' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/webhooks/website should process message with session_id', async () => {
    const res = await request(app)
      .post('/api/webhooks/website')
      .send({
        session_id: `session-${Date.now()}`,
        sender_name: 'Website Visitor',
        message: 'Hello from website chat',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { leadExtractor } from '../../../src/services/leadExtractor.js';
import { connectDB, disconnectDB } from '../../../src/config/db.js';
import { Lead, Conversation } from '../../../src/models/index.js';

describe('leadExtractor Real Unit Tests', () => {
  let testConversation = null;

  beforeAll(async () => {
    await connectDB();
    testConversation = await Conversation.create({
      platform: 'webchat',
      external_chat_id: `ext-lead-${Date.now()}`,
      sender_name: 'Prospect John',
      sender_email: '',
      sender_phone: '',
    });
  });

  afterAll(async () => {
    if (testConversation) {
      await Lead.deleteMany({ conversation_id: testConversation._id });
      await Conversation.deleteOne({ _id: testConversation._id });
    }
    await disconnectDB();
  });

  it('should return null if invalid parameters provided', async () => {
    expect(await leadExtractor.extractAndSyncLead(null, 'hello')).toBeNull();
    expect(await leadExtractor.extractAndSyncLead(testConversation, '')).toBeNull();
  });

  it('should extract email and phone numbers from message text', async () => {
    const message = 'Hello, my email is john.doe@example.com and phone is +91 9876543210';
    const lead = await leadExtractor.extractAndSyncLead(testConversation, message);

    expect(lead).toBeDefined();
    expect(lead.email_address).toBe('john.doe@example.com');
    expect(lead.phone_number).toContain('9876543210');
    expect(lead.lead_tags).toContain('#CONTACT_SHARED');
    expect(lead.lead_tags).toContain('#PHONE_SHARED');
  });

  it('should detect pricing inquiry and flag hot lead', async () => {
    const message = 'Can you share the pricing quote for enterprise plan?';
    const lead = await leadExtractor.extractAndSyncLead(testConversation, message);

    expect(lead.lead_tags).toContain('#PRICING_INQUIRY');
    expect(lead.lead_tags).toContain('#HOT_LEAD');
    expect(lead.lead_tags).toContain('#VIP');
    expect(lead.lead_score).toBeGreaterThanOrEqual(95);
  });
});

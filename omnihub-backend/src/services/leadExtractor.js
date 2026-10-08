import { Lead, Conversation } from '../models/index.js';
import leadParsingService from './leadParsingService.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';

// Regex for extracting email address
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

// Regex for Indian & International phone numbers
const PHONE_REGEX = /(?:\+?91[\s.-]?)?[6-9]\d{9}|(?:\+?[1-9]\d{0,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

// Regex for customer introduction: "I am Rohit Verma" or "My name is Priya"
const NAME_REGEX = /(?:i am|my name is|this is|myself)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i;

export const leadExtractor = {
  /**
   * Automatically extracts contact info and CRM data from inbound messages.
   */
  async extractAndSyncLead(conversation, textContent) {
    if (!conversation || !textContent) return null;

    try {
      let lead = await Lead.findOne({ conversation_id: conversation._id });
      if (!lead) {
        lead = new Lead({
          conversation_id: conversation._id,
          full_name: conversation.sender_name && conversation.sender_name !== 'Customer' ? conversation.sender_name : 'Prospect',
          phone_number: conversation.sender_phone || '',
          email_address: conversation.sender_email || '',
          lead_tags: ['#NEW_LEAD'],
          status: 'NEW',
        });
      }

      let tagsChanged = false;

      // 1. Name Extraction
      const matchName = textContent.match(NAME_REGEX);
      if (matchName && (!lead.full_name || lead.full_name === 'Customer' || lead.full_name === 'Prospect' || lead.full_name === 'Website Visitor')) {
        lead.full_name = matchName[1].trim();
        tagsChanged = true;
      }

      // 2. Email Extraction
      const matchEmail = textContent.match(EMAIL_REGEX);
      if (matchEmail) {
        const extractedEmail = matchEmail[0].toLowerCase();
        if (lead.email_address !== extractedEmail) {
          lead.email_address = extractedEmail;
          lead.lead_tags = [...new Set([...lead.lead_tags, '#CONTACT_SHARED'])];
          tagsChanged = true;
        }
      }

      // 3. Phone Extraction
      const matchPhone = textContent.match(PHONE_REGEX);
      if (matchPhone && matchPhone[0].replace(/\D/g, '').length >= 10) {
        const extractedPhone = matchPhone[0].trim();
        if (lead.phone_number !== extractedPhone) {
          lead.phone_number = extractedPhone;
          lead.lead_tags = [...new Set([...lead.lead_tags, '#PHONE_SHARED'])];
          tagsChanged = true;
        }
      }

      // 4. Intent & Auto-Tagging
      const lower = textContent.toLowerCase();

      if (/price|pricing|cost|quote|discount|kitna|rate|budget/i.test(lower)) {
        lead.lead_tags = [...new Set([...lead.lead_tags, '#PRICING_INQUIRY', '#HOT_LEAD'])];
        tagsChanged = true;
      }

      if (/demo|walkthrough|presentation|trial|showcase/i.test(lower)) {
        lead.lead_tags = [...new Set([...lead.lead_tags, '#DEMO_REQUEST'])];
        tagsChanged = true;
      }

      if (/setup|error|bug|issue|failed|not working|problem|help|broken/i.test(lower)) {
        lead.lead_tags = [...new Set([...lead.lead_tags, '#SUPPORT', '#SETUP_ISSUE'])];
        tagsChanged = true;
      }

      if (/urgent|asap|emergency|jaldi|immediately|right now/i.test(lower)) {
        lead.lead_tags = [...new Set([...lead.lead_tags, '#URGENT', '#HOT_LEAD'])];
        tagsChanged = true;
      }

      if (/enterprise|company|partnership|annual|team|custom/i.test(lower)) {
        lead.lead_tags = [...new Set([...lead.lead_tags, '#VIP', '#ENTERPRISE'])];
        tagsChanged = true;
      }

      // 5. Dynamic Lead Score Calculation
      lead.lead_score = leadParsingService.computeLeadScore({
        tags: lead.lead_tags,
        hasEmail: Boolean(lead.email_address),
        hasPhone: Boolean(lead.phone_number),
      });

      // Advance pipeline status if qualified
      if (lead.status === 'NEW' && (lead.email_address || lead.phone_number) && lead.lead_tags.includes('#HOT_LEAD')) {
        lead.status = 'QUALIFIED';
      }

      await lead.save();

      // Sync extracted contact info back to conversation record
      let convUpdated = false;
      if (lead.full_name && lead.full_name !== 'Prospect' && conversation.sender_name !== lead.full_name) {
        conversation.sender_name = lead.full_name;
        convUpdated = true;
      }
      if (lead.email_address && !conversation.sender_email) {
        conversation.sender_email = lead.email_address;
        convUpdated = true;
      }
      if (lead.phone_number && !conversation.sender_phone) {
        conversation.sender_phone = lead.phone_number;
        convUpdated = true;
      }
      if (convUpdated) {
        await conversation.save();
      }

      // Real-time broadcast to dashboard LeadSidebar
      emitEvent('lead_updated', {
        conversation_id: conversation._id,
        lead: {
          id: lead._id,
          _id: lead._id,
          conversation_id: conversation._id,
          full_name: lead.full_name,
          phone_number: lead.phone_number,
          email_address: lead.email_address,
          company: lead.company,
          lead_score: lead.lead_score,
          lead_tags: lead.lead_tags,
          status: lead.status,
          notes: lead.notes,
        },
      });

      logger.info(`[Lead Extractor] Synced CRM lead for conversation ${conversation._id} (Score: ${lead.lead_score}, Tags: [${lead.lead_tags.join(', ')}])`);
      return lead;
    } catch (err) {
      logger.warn(`[Lead Extractor Error] ${err.message}`);
      return null;
    }
  },
};

export default leadExtractor;

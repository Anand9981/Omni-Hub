import { Lead } from '../models/index.js';
import leadParsingService from './leadParsingService.js';
import logger from '../utils/logger.js';

const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
const PHONE_REGEX = /(\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4})/;

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
          full_name: conversation.sender_name || 'Prospect',
          phone_number: conversation.sender_phone || '',
          email_address: conversation.sender_email || '',
          lead_tags: ['#NEW_LEAD'],
          status: 'NEW',
        });
      }

      // Check for email extraction
      if (!lead.email_address) {
        const matchEmail = textContent.match(EMAIL_REGEX);
        if (matchEmail) {
          lead.email_address = matchEmail[0];
          lead.lead_tags = [...new Set([...lead.lead_tags, '#CONTACT_SHARED'])];
        }
      }

      // Check for phone extraction
      if (!lead.phone_number) {
        const matchPhone = textContent.match(PHONE_REGEX);
        if (matchPhone && matchPhone[0].length >= 8) {
          lead.phone_number = matchPhone[0];
          lead.lead_tags = [...new Set([...lead.lead_tags, '#PHONE_SHARED'])];
        }
      }

      // Detect high-intent keywords
      const lower = textContent.toLowerCase();
      if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('quote')) {
        lead.lead_tags = [...new Set([...lead.lead_tags, '#PRICING_INQUIRY', '#HOT_LEAD'])];
      }
      if (lower.includes('enterprise') || lower.includes('company') || lower.includes('partnership')) {
        lead.lead_tags = [...new Set([...lead.lead_tags, '#VIP'])];
      }

      lead.lead_score = leadParsingService.computeLeadScore({
        tags: lead.lead_tags,
        hasEmail: Boolean(lead.email_address),
        hasPhone: Boolean(lead.phone_number),
      });

      await lead.save();
      return lead;
    } catch (err) {
      logger.warn(`[Lead Extractor Error] ${err.message}`);
      return null;
    }
  },
};

export default leadExtractor;

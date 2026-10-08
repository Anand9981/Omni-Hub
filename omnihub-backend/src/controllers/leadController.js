import { Lead } from '../models/index.js';
import leadParsingService from '../services/leadParsingService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const leadController = {
  async listAllLeads(_req, res, next) {
    try {
      const leads = await Lead.find().populate('conversation_id').sort({ created_at: -1 });
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, leads, 'CRM leads loaded.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async getLeadByConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const lead = await Lead.findOne({ conversation_id: conversationId });
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, lead, 'Lead details retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async updateLead(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { full_name, phone_number, email_address, company, lead_tags, notes, status } = req.body;

      let lead = await Lead.findOne({ conversation_id: conversationId });
      if (!lead) {
        lead = new Lead({ conversation_id: conversationId });
      }

      if (full_name !== undefined) lead.full_name = full_name;
      if (phone_number !== undefined) lead.phone_number = phone_number;
      if (email_address !== undefined) lead.email_address = email_address;
      if (company !== undefined) lead.company = company;
      if (notes !== undefined) lead.notes = notes;
      if (status !== undefined) lead.status = status;

      if (lead_tags !== undefined) {
        lead.lead_tags = leadParsingService.normalizeTags(lead_tags);
      }

      lead.lead_score = leadParsingService.computeLeadScore({
        tags: lead.lead_tags,
        hasEmail: Boolean(lead.email_address),
        hasPhone: Boolean(lead.phone_number),
      });

      await lead.save();

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, lead, 'Lead CRM details saved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async updateTags(req, res, next) {
    try {
      const { conversation_id, conversationId, tags } = req.body;
      const targetId = conversation_id || conversationId;
      if (!targetId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, null, 'conversation_id is required.'));
      }

      let lead = await Lead.findOne({ conversation_id: targetId });
      if (!lead) {
        lead = new Lead({ conversation_id: targetId });
      }

      lead.lead_tags = leadParsingService.normalizeTags(tags || []);
      lead.lead_score = leadParsingService.computeLeadScore({
        tags: lead.lead_tags,
        hasEmail: Boolean(lead.email_address),
        hasPhone: Boolean(lead.phone_number),
      });

      await lead.save();

      return res.status(HTTP_STATUS.OK).json(formatResponse(true, lead, 'Lead tags updated.'));
    } catch (error) {
      next(error);
    }
  },
};

export default leadController;

import aiService from '../services/aiService.js';
import { Conversation, Message } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const aiController = {
  /**
   * Generate automated customer support reply
   */
  async generateReply(req, res, next) {
    try {
      const { text, history } = req.body;
      if (!text || !text.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Customer message text is required.'),
        );
      }

      const result = await aiService.generateReply({
        userMessage: text,
        conversationHistory: history || [],
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'AI reply generated.'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate 3 quick Smart Reply Suggestions + sentiment + intent for human agent
   */
  async generateSuggestions(req, res, next) {
    try {
      const { text, history, channel } = req.body;
      if (!text || !text.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Message text is required for suggestions.'),
        );
      }

      const result = await aiService.generateSuggestions({
        text,
        history: history || [],
        channel: channel || 'general',
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'AI Smart Suggestions generated.'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Auto-summarize an entire conversation thread
   */
  async summarizeConversation(req, res, next) {
    try {
      let { messages, customerName, conversationId } = req.body;

      // If conversationId is supplied but messages aren't, fetch thread from DB
      if (conversationId && (!messages || messages.length === 0)) {
        const dbMessages = await Message.find({ conversation_id: conversationId }).sort({ created_at: 1 });
        messages = dbMessages.map((m) => ({
          sender_type: m.sender_type,
          direction: m.direction,
          text_content: m.text_content,
        }));

        if (!customerName) {
          const conv = await Conversation.findById(conversationId);
          if (conv) customerName = conv.sender_name;
        }
      }

      if (!messages || messages.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'No messages found to summarize.'),
        );
      }

      const result = await aiService.summarizeConversation({
        messages,
        customerName: customerName || 'Customer',
      });

      // Persist summary to conversation document if conversationId is provided
      if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, {
          ai_summary: result.summary,
          sentiment: result.customerSentiment,
          intent: result.intent,
        });
      }

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Conversation summarized successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Analyze message sentiment, intent, urgency, and language
   */
  async analyzeMessage(req, res, next) {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Text is required for analysis.'),
        );
      }

      const result = await aiService.analyzeMessage({ text });
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Sentiment and intent analyzed.'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Rephrase / Polish draft with selected tone
   */
  async polishDraft(req, res, next) {
    try {
      const { text, tone } = req.body;
      if (!text || !text.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Draft text is required to polish.'),
        );
      }

      const polishedText = await aiService.polishDraft({ text, tone });
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, { polishedText }, 'Draft polished successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Language detection helper
   */
  async detectLanguage(req, res, next) {
    try {
      const { text } = req.body;
      const language = aiService.detectLanguage(text || '');
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, { language }, 'Language detected.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default aiController;

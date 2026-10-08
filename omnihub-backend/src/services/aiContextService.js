import { AIContext } from '../models/index.js';
import logger from '../utils/logger.js';

export const aiContextService = {
  async getContext() {
    let context = await AIContext.findOne();
    if (!context) {
      context = await AIContext.create({});
    }
    return context;
  },

  async updateContext(updates) {
    let context = await AIContext.findOne();
    if (!context) {
      context = new AIContext(updates);
    } else {
      Object.assign(context, updates);
    }
    await context.save();
    logger.info('[AI Context] Updated business AI instructions and knowledge base.');
    return context;
  },

  async addFaq(question, answer) {
    const context = await this.getContext();
    context.faqs.push({ question: question.trim(), answer: answer.trim() });
    await context.save();
    return context;
  },

  async deleteFaq(faqIndex) {
    const context = await this.getContext();
    if (faqIndex >= 0 && faqIndex < context.faqs.length) {
      context.faqs.splice(faqIndex, 1);
      await context.save();
    }
    return context;
  },
};

export default aiContextService;

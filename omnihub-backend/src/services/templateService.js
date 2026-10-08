import { Template } from '../models/index.js';
import logger from '../utils/logger.js';

export const templateService = {
  async list(filter = {}) {
    const query = {};
    if (filter.category && filter.category !== 'all') query.category = filter.category;
    if (filter.status && filter.status !== 'all') query.status = filter.status;
    return Template.find(query).sort({ created_at: -1 }).lean();
  },

  async getById(id) {
    return Template.findById(id).lean();
  },

  async create(data, userId) {
    const template = await Template.create({
      ...data,
      status: 'PENDING',
      created_by: userId,
    });
    logger.info(`[TemplateService] Created message template: ${data.name}`);
    return template;
  },

  async update(id, data) {
    return Template.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async delete(id) {
    return Template.findByIdAndDelete(id);
  },
};

export default templateService;

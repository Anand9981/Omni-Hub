import { CannedResponse } from '../models/index.js';
import logger from '../utils/logger.js';

export const cannedResponseService = {
  async list(filter = {}) {
    const query = {};
    if (filter.category && filter.category !== 'all') query.category = filter.category;
    if (filter.search) {
      query.$or = [
        { shortcut: { $regex: filter.search, $options: 'i' } },
        { title: { $regex: filter.search, $options: 'i' } },
        { body: { $regex: filter.search, $options: 'i' } },
      ];
    }
    return CannedResponse.find(query).sort({ is_favorite: -1, shortcut: 1 }).lean();
  },

  async create(data, userId) {
    const shortcut = data.shortcut.startsWith('/') ? data.shortcut : `/${data.shortcut}`;
    const response = await CannedResponse.create({
      ...data,
      shortcut,
      created_by: userId,
    });
    logger.info(`[CannedResponseService] Created shortcut ${shortcut}`);
    return response;
  },

  async update(id, data) {
    if (data.shortcut && !data.shortcut.startsWith('/')) {
      data.shortcut = `/${data.shortcut}`;
    }
    return CannedResponse.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async delete(id) {
    return CannedResponse.findByIdAndDelete(id);
  },
};

export default cannedResponseService;

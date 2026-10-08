import { CannedResponse } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const cannedResponseController = {
  async getAll(req, res) {
    try {
      const { category, search } = req.query;
      const filter = {};

      if (category && category !== 'all') {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { shortcut: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { body: { $regex: search, $options: 'i' } },
        ];
      }

      const items = await CannedResponse.find(filter).sort({ is_favorite: -1, shortcut: 1 }).lean();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, items, 'Canned responses retrieved successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async getById(req, res) {
    try {
      const item = await CannedResponse.findById(req.params.id);
      if (!item) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Canned response not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, item));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async create(req, res) {
    try {
      const { shortcut, title, body, category, tags, language } = req.body;
      const formattedShortcut = shortcut.startsWith('/') ? shortcut : `/${shortcut}`;

      const existing = await CannedResponse.findOne({ shortcut: formattedShortcut });
      if (existing) {
        return res.status(HTTP_STATUS.CONFLICT).json(formatResponse(false, null, 'Shortcut already exists.'));
      }

      const item = await CannedResponse.create({
        shortcut: formattedShortcut,
        title,
        body,
        category: category || 'General',
        tags: tags || [],
        language: language || 'en',
        created_by: req.user?._id,
      });

      return res.status(HTTP_STATUS.CREATED).json(formatResponse(true, item, 'Canned response created successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      const { shortcut } = req.body;
      if (shortcut) {
        req.body.shortcut = shortcut.startsWith('/') ? shortcut : `/${shortcut}`;
      }

      const item = await CannedResponse.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Canned response not found.'));
      }

      return res.status(HTTP_STATUS.OK).json(formatResponse(true, item, 'Canned response updated successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async delete(req, res) {
    try {
      const item = await CannedResponse.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Canned response not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, { id: req.params.id }, 'Canned response deleted.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default cannedResponseController;

import { Template } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const templateController = {
  async getAll(req, res) {
    try {
      const { category, status } = req.query;
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (status && status !== 'all') filter.status = status;

      const templates = await Template.find(filter).sort({ created_at: -1 }).lean();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, templates, 'Templates retrieved successfully.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async getById(req, res) {
    try {
      const template = await Template.findById(req.params.id);
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Template not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, template));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async create(req, res) {
    try {
      const { name, category, language, body, variables } = req.body;

      const template = await Template.create({
        name,
        category: category || 'UTILITY',
        language: language || 'en_US',
        body,
        variables: variables || [],
        status: 'PENDING',
        created_by: req.user?._id,
      });

      return res.status(HTTP_STATUS.CREATED).json(formatResponse(true, template, 'Template submitted for approval.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Template not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, template, 'Template updated.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async delete(req, res) {
    try {
      const template = await Template.findByIdAndDelete(req.params.id);
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Template not found.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, { id: req.params.id }, 'Template deleted.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default templateController;

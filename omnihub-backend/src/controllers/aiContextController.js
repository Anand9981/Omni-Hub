import aiContextService from '../services/aiContextService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const aiContextController = {
  async getContext(_req, res, next) {
    try {
      const context = await aiContextService.getContext();
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, context, 'AI Context retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async updateContext(req, res, next) {
    try {
      const context = await aiContextService.updateContext(req.body);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, context, 'AI Context & Knowledge Base updated.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async addFaq(req, res, next) {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Both question and answer are required.'),
        );
      }
      const context = await aiContextService.addFaq(question, answer);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, context, 'FAQ added to AI Knowledge Base.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteFaq(req, res, next) {
    try {
      const { index } = req.params;
      const context = await aiContextService.deleteFaq(parseInt(index, 10));
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, context, 'FAQ deleted.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default aiContextController;

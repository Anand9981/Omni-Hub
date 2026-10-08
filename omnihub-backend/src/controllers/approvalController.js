import approvalService from '../services/approvalService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const approvalController = {
  async getPendingApprovals(_req, res, next) {
    try {
      const approvals = await approvalService.listPending();
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, approvals, 'Pending approvals retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async approveDraft(req, res, next) {
    try {
      const { id } = req.params;
      const result = await approvalService.approveDraft(id, req.user._id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Draft approved and dispatched to customer.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async rejectDraft(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await approvalService.rejectDraft(id, req.user._id, reason);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Draft rejected successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async getResolvedApprovals(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 10;
      const approvals = await approvalService.listResolved(limit);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, approvals, 'Resolved approvals retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async editAndApproveDraft(req, res, next) {
    try {
      const { id } = req.params;
      const { text, sendImmediately } = req.body;
      if (!text || !text.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Edited text cannot be empty.'),
        );
      }
      if (sendImmediately === false) {
        const result = await approvalService.editDraft(id, text);
        return res.status(HTTP_STATUS.OK).json(
          formatResponse(true, result, 'Draft updated in queue.'),
        );
      }
      const result = await approvalService.editAndApproveDraft(id, text, req.user._id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Draft updated and sent to customer.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default approvalController;

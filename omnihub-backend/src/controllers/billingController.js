import { billingService } from '../services/billingService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const billingController = {
  async getPlans(req, res) {
    try {
      const plans = await billingService.getPlans();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, plans, 'Available billing plans retrieved.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async getSubscription(req, res) {
    try {
      const subscription = await billingService.getUserSubscription(req.user._id);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, subscription, 'Current subscription details.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async updateSubscription(req, res) {
    try {
      const planId = req.body.plan_id || req.body.selectedPlan || 'basic';
      const updated = await billingService.updateSubscription(req.user._id, {
        ...req.body,
        plan_id: planId,
      });
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, updated, `Subscription updated to ${planId}.`));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async getInvoices(req, res) {
    try {
      const invoices = await billingService.getUserInvoices(req.user._id);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, invoices, 'Invoices retrieved.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default billingController;

import { subscriptionService } from '../services/subscriptionService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const subscriptionController = {
  async getDetails(req, res) {
    try {
      const details = await subscriptionService.getSubscriptionDetails(req.user._id);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, details, 'Subscription status.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default subscriptionController;

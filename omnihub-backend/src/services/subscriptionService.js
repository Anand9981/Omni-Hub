import { Subscription } from '../models/index.js';

export const subscriptionService = {
  async getSubscriptionDetails(userId) {
    const subscription = await Subscription.findOne({ user_id: userId }).lean();
    if (!subscription) {
      return {
        plan_id: 'starter',
        status: 'trialing',
        is_active: true,
        days_remaining: 14,
      };
    }
    const daysRemaining = Math.max(
      0,
      Math.ceil((new Date(subscription.current_period_end) - new Date()) / (1000 * 60 * 60 * 24)),
    );
    return {
      ...subscription,
      is_active: ['active', 'trialing'].includes(subscription.status),
      days_remaining: daysRemaining,
    };
  },
};

export default subscriptionService;

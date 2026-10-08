import { Plan, Subscription, Invoice } from '../models/index.js';
import logger from '../utils/logger.js';

export const billingService = {
  async getPlans() {
    let plans = await Plan.find({ is_active: true }).lean();
    if (!plans || plans.length === 0) {
      // Seed default plans if none exist
      const defaultPlans = [
        {
          plan_id: 'starter',
          name: 'Starter Plan',
          price: 29,
          currency: 'USD',
          billing_interval: 'month',
          features: ['Up to 1,000 Messages', '2 Team Agents', '3 Channel Connections', 'Basic AI Autopilot'],
          limits: { messages_per_month: 1000, agents_count: 2, channels_count: 3 },
        },
        {
          plan_id: 'pro',
          name: 'Pro Automation',
          price: 79,
          currency: 'USD',
          billing_interval: 'month',
          features: ['Up to 10,000 Messages', '10 Team Agents', 'All Channels Connected', 'Advanced Gemini AI + Custom FAQ'],
          limits: { messages_per_month: 10000, agents_count: 10, channels_count: 6 },
        },
        {
          plan_id: 'enterprise',
          name: 'Enterprise Hub',
          price: 199,
          currency: 'USD',
          billing_interval: 'month',
          features: ['Unlimited Messages', 'Unlimited Agents', 'Dedicated Support', 'Custom AI Fine-Tuning'],
          limits: { messages_per_month: 999999, agents_count: 100, channels_count: 10 },
        },
      ];
      await Plan.insertMany(defaultPlans);
      plans = await Plan.find({ is_active: true }).lean();
    }
    return plans;
  },

  async getUserSubscription(userId) {
    let sub = await Subscription.findOne({ user_id: userId });
    if (!sub) {
      sub = await Subscription.create({
        user_id: userId,
        plan_id: 'starter',
        status: 'trialing',
      });
    }
    return sub;
  },

  async updateSubscription(userId, planId) {
    const sub = await Subscription.findOneAndUpdate(
      { user_id: userId },
      {
        $set: {
          plan_id: planId,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true, new: true },
    );
    logger.info(`[BillingService] User ${userId} upgraded/updated subscription to plan [${planId}]`);
    return sub;
  },

  async getUserInvoices(userId) {
    const invoices = await Invoice.find({ user_id: userId }).sort({ created_at: -1 }).lean();
    return invoices;
  },
};

export default billingService;

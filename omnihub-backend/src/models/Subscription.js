import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan_id: {
      type: String,
      required: true,
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'incomplete'],
      default: 'trialing',
      index: true,
    },
    current_period_start: {
      type: Date,
      default: Date.now,
    },
    current_period_end: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    },
    cancel_at_period_end: {
      type: Boolean,
      default: false,
    },
    billing_cycle: {
      type: String,
      default: 'monthly',
    },
    auto_renew: {
      type: Boolean,
      default: false,
    },
    payment_gateway: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

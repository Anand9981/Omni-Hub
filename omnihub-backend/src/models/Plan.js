import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    plan_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    billing_interval: {
      type: String,
      enum: ['month', 'year'],
      default: 'month',
    },
    features: [String],
    limits: {
      messages_per_month: Number,
      agents_count: Number,
      channels_count: Number,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const Plan = mongoose.model('Plan', planSchema);
export default Plan;

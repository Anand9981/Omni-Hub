import mongoose from 'mongoose';

const onboardingProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    current_step: {
      type: Number,
      default: 1,
    },
    completed_steps: {
      type: [Number],
      default: [],
    },
    checklist: {
      business_info: { type: Boolean, default: false },
      channel_connected: { type: Boolean, default: false },
      knowledge_base: { type: Boolean, default: false },
      team_invited: { type: Boolean, default: false },
      test_message_sent: { type: Boolean, default: false },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const OnboardingProgress = mongoose.model('OnboardingProgress', onboardingProgressSchema);
export default OnboardingProgress;

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
      enum: ['not_started', 'in_progress', 'skipped', 'completed'],
      default: 'in_progress',
    },
    current_step: {
      type: Number,
      default: 3,
    },
    completed_steps: {
      type: [Number],
      default: [1, 2],
    },
    checklist: {
      business_info: { type: Boolean, default: false },
      channel_connected: { type: Boolean, default: false },
      knowledge_base: { type: Boolean, default: false },
      team_invited: { type: Boolean, default: false },
      test_message_sent: { type: Boolean, default: false },
    },
    business: {
      name: { type: String, default: '' },
      industry: { type: String, default: '' },
      hours: { type: String, default: '' },
    },
    channels: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    knowledge: {
      type: mongoose.Schema.Types.Mixed,
      default: { text: '', language: 'English', websiteUrl: '', files: [], faqs: [] },
    },
    invited_agents: {
      type: [String],
      default: [],
    },
    tests: {
      type: mongoose.Schema.Types.Mixed,
      default: { message: false, aiReply: false, menu: false, approval: false, analytics: false },
    },
    completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const OnboardingProgress = mongoose.model('OnboardingProgress', onboardingProgressSchema);
export default OnboardingProgress;

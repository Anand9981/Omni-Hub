import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      unique: true,
      index: true,
    },
    full_name: {
      type: String,
      trim: true,
    },
    phone_number: {
      type: String,
      trim: true,
    },
    email_address: {
      type: String,
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    lead_score: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    lead_tags: {
      type: [String],
      default: ['#NEW_LEAD'],
      index: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'],
      default: 'NEW',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

leadSchema.index({ full_name: 'text', email_address: 'text', phone_number: 'text' });

export const Lead = mongoose.model('Lead', leadSchema);
export default Lead;

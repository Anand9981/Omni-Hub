import mongoose from 'mongoose';

const cannedResponseSchema = new mongoose.Schema(
  {
    shortcut: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'en',
    },
    is_favorite: {
      type: Boolean,
      default: false,
    },
    usage_count: {
      type: Number,
      default: 0,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const CannedResponse = mongoose.model('CannedResponse', cannedResponseSchema);
export default CannedResponse;

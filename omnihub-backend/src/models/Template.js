import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION', 'SERVICE', 'Marketing', 'Utility', 'Authentication', 'Service'],
      default: 'Utility',
      index: true,
    },
    language: {
      type: String,
      default: 'English',
    },
    body: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'DRAFT',
      index: true,
    },
    rejection_reason: {
      type: String,
      default: '',
    },
    version: {
      type: Number,
      default: 1,
    },
    versions: {
      type: Array,
      default: [],
    },
    submitted_at: {
      type: Date,
      default: null,
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

export const Template = mongoose.model('Template', templateSchema);
export default Template;

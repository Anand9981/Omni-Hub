import mongoose from 'mongoose';

const pendingApprovalSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    proposed_text: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: 'AI proposed reply',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EDITED'],
      default: 'PENDING',
      index: true,
    },
    reviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    edited_text: {
      type: String,
    },
    rejected_reason: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const PendingApproval = mongoose.model('PendingApproval', pendingApprovalSchema);
export default PendingApproval;

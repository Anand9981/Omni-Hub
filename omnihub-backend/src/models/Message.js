import mongoose from 'mongoose';
import { PLATFORMS, MESSAGE_DIRECTIONS, MESSAGE_STATUS } from '../utils/constants.js';

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: Object.values(PLATFORMS),
      required: true,
    },
    sender_type: {
      type: String,
      enum: ['USER', 'AGENT', 'BOT'],
      required: true,
    },
    author_name: {
      type: String,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    direction: {
      type: String,
      enum: Object.values(MESSAGE_DIRECTIONS),
      required: true,
      index: true,
    },
    text_content: {
      type: String,
      default: '',
    },
    media_url: {
      type: String,
    },
    media_type: {
      type: String,
    },
    media_name: {
      type: String,
    },
    buttons: [
      {
        id: String,
        label: String,
        action: String,
        payload: String,
        children: Array,
      },
    ],
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUS),
      default: MESSAGE_STATUS.SENT,
      index: true,
    },
    retry_count: {
      type: Number,
      default: 0,
    },
    retry_queued_at: {
      type: Date,
    },
    is_note_only: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

messageSchema.index({ conversation_id: 1, created_at: -1 });
messageSchema.index({ text_content: 'text' });

export const Message = mongoose.model('Message', messageSchema);
export default Message;

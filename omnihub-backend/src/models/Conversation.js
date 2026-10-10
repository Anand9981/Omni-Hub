import mongoose from 'mongoose';
import { PLATFORMS, AUTOPILOT_MODES, APPROVAL_MODES } from '../utils/constants.js';

const conversationSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: Object.values(PLATFORMS),
      required: true,
      index: true,
    },
    external_chat_id: {
      type: String,
      required: true,
      index: true,
    },
    sender_name: {
      type: String,
      default: 'Unknown User',
    },
    sender_phone: {
      type: String,
    },
    sender_email: {
      type: String,
    },
    auto_pilot: {
      type: String,
      enum: Object.values(AUTOPILOT_MODES),
      default: AUTOPILOT_MODES.ON,
    },
    approval_mode: {
      type: String,
      enum: Object.values(APPROVAL_MODES),
      default: APPROVAL_MODES.AUTO,
    },
    assigned_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    unread_count: {
      type: Number,
      default: 0,
    },
    last_activity_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentiment: {
      type: String,
      default: null,
    },
    intent: {
      type: String,
      default: null,
    },
    urgency: {
      type: String,
      default: null,
    },
    ai_summary: {
      type: String,
      default: null,
    },
    ai_suggestions: [
      {
        id: String,
        type: { type: String, default: 'Friendly' },
        text: String,
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

conversationSchema.index({ platform: 1, external_chat_id: 1 }, { unique: true });
conversationSchema.index({ sender_name: 'text', sender_email: 'text', sender_phone: 'text' });

export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;

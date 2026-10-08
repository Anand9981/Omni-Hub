import mongoose from 'mongoose';
import crypto from 'crypto';
import { ROLES } from '../utils/constants.js';

const teamInviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.AGENT,
      required: true,
    },
    invited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invite_token: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex'),
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
      index: true,
    },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    accepted_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const TeamInvite = mongoose.model('TeamInvite', teamInviteSchema);
export default TeamInvite;


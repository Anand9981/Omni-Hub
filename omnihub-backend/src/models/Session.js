import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    refresh_token: {
      type: String,
      index: true,
    },
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
    },
    device_info: {
      browser: String,
      os: String,
      device: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const Session = mongoose.model('Session', sessionSchema);
export default Session;

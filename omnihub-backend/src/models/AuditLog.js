import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity_type: {
      type: String,
      required: true,
      index: true,
    },
    entity_id: {
      type: String,
      index: true,
    },
    old_value: {
      type: mongoose.Schema.Types.Mixed,
    },
    new_value: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip_address: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  },
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

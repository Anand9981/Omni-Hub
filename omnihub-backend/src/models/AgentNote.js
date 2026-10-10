import mongoose from 'mongoose';

const agentNoteSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: String,
      required: true,
      index: true,
    },
    author_id: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    author_name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'General note',
    },
    assigned_agent_id: {
      type: String,
      default: null,
    },
    attachments: {
      type: Array,
      default: [],
    },
    visibility: {
      type: String,
      default: 'internal',
    },
    mentions: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const AgentNote = mongoose.model('AgentNote', agentNoteSchema);
export default AgentNote;

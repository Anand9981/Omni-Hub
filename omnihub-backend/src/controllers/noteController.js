import noteService from '../services/noteService.js';
import { AgentNote } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

function formatNote(n) {
  const plain = n?.toObject ? n.toObject() : n;
  if (!plain) return null;
  return {
    ...plain,
    id: String(plain._id || plain.id),
    text: plain.content || plain.text || '',
    content: plain.content || plain.text || '',
    type: plain.type || 'General note',
    mentions: Array.isArray(plain.mentions) ? plain.mentions : [],
    attachments: Array.isArray(plain.attachments) ? plain.attachments : [],
    visibility: plain.visibility || 'internal',
  };
}

const DEFAULT_NOTES = [
  {
    conversation_id: 'cnv-rahul',
    author_name: 'Priya (Agent)',
    content: 'Client is facing webhook token verification mismatch on WhatsApp Meta console. Requested access to verify payload.',
    type: 'Issue',
  },
  {
    conversation_id: 'cnv-sarah',
    author_name: 'Admin',
    content: 'Interested in annual commitment with 3 connected channels. Follow up with commercial proposal.',
    type: 'Follow-up',
  },
  {
    conversation_id: 'cnv-priya',
    author_name: 'You',
    content: 'Scheduled product walkthrough demo for tomorrow at 4:00 PM via Google Meet.',
    type: 'General note',
  },
];

export const noteController = {
  async getNotes(req, res, next) {
    try {
      const count = await AgentNote.countDocuments();
      if (count === 0) {
        await AgentNote.insertMany(DEFAULT_NOTES);
      }
      const { conversationId } = req.params;
      const notes = await noteService.listNotes(conversationId);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, notes.map(formatNote), 'Notes loaded.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async addNote(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { content, text, type, assignedAgentId, mentions, attachments, authorName, authorId } = req.body;

      const note = await noteService.addNote({
        conversationId,
        authorId: req.user?._id || authorId,
        authorName: req.user?.name || authorName || 'You',
        content: content || text,
        type,
        assignedAgentId,
        mentions,
        attachments,
      });

      return res.status(HTTP_STATUS.CREATED).json(
        formatResponse(true, formatNote(note), 'Note added successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteNote(req, res, next) {
    try {
      const { noteId } = req.params;
      await noteService.deleteNote(noteId, req.user?._id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, null, 'Note deleted.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async getMentionNotifications(req, res, next) {
    try {
      const agentId = req.query.agentId || String(req.user?._id || '');
      const notes = await AgentNote.find({
        $or: [
          { 'mentions.user_id': req.user?._id },
          { 'mentions.id': agentId },
        ],
      })
        .sort({ created_at: -1 })
        .limit(20)
        .lean();

      const notifications = notes.map((n) => ({
        id: `mention-${n._id}`,
        note_id: String(n._id),
        conversation_id: n.conversation_id,
        agent_id: agentId,
        author_name: n.author_name,
        content: n.content,
        created_at: n.created_at,
        read: false,
      }));

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, notifications, 'Mentions retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default noteController;

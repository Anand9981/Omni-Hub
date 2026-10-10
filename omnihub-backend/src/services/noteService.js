import { AgentNote, User } from '../models/index.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';

const MENTION_REGEX = /@([a-zA-Z0-9._-]+)/g;

export const noteService = {
  async listNotes(conversationId) {
    return AgentNote.find({ conversation_id: String(conversationId) }).sort({ created_at: -1 });
  },

  async addNote({ conversationId, authorId, authorName, content, type, assignedAgentId, mentions: passedMentions, attachments }) {
    const mentions = Array.isArray(passedMentions) && passedMentions.length > 0 ? [...passedMentions] : [];
    const matches = String(content || '').match(MENTION_REGEX);

    if (matches && mentions.length === 0) {
      for (const match of matches) {
        const usernameOrName = match.substring(1);
        const mentionedUser = await User.findOne({
          $or: [
            { name: new RegExp(`^${usernameOrName}$`, 'i') },
            { email: new RegExp(`^${usernameOrName}@`, 'i') },
          ],
        });

        if (mentionedUser) {
          mentions.push({
            id: String(mentionedUser._id),
            user_id: mentionedUser._id,
            name: mentionedUser.name,
            email: mentionedUser.email,
          });
        }
      }
    }

    const note = await AgentNote.create({
      conversation_id: String(conversationId),
      author_id: authorId,
      author_name: authorName || 'You',
      content,
      type: type || 'General note',
      assigned_agent_id: assignedAgentId || null,
      attachments: Array.isArray(attachments) ? attachments : [],
      mentions,
      visibility: 'internal',
    });

    if (mentions.length > 0) {
      for (const mention of mentions) {
        const targetId = mention.user_id || mention.id;
        if (targetId) {
          emitEvent(`mention_${targetId}`, {
            noteId: note._id,
            conversation_id: conversationId,
            authorName,
            content,
            created_at: note.created_at,
          });
        }
      }
    }

    emitEvent('new_note', {
      conversation_id: conversationId,
      note,
    });

    logger.info(`[Note Service] Agent ${authorName} posted internal note on conversation ${conversationId}`);
    return note;
  },

  async deleteNote(noteId) {
    const note = await AgentNote.findByIdAndDelete(noteId);
    if (note) {
      emitEvent('delete_note', { noteId, conversation_id: note.conversation_id });
    }
    return note;
  },
};

export default noteService;

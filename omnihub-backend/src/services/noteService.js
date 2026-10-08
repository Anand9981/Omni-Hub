import { AgentNote, User } from '../models/index.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';

const MENTION_REGEX = /@([a-zA-Z0-9._-]+)/g;

export const noteService = {
  async listNotes(conversationId) {
    return AgentNote.find({ conversation_id: conversationId }).sort({ created_at: 1 });
  },

  async addNote({ conversationId, authorId, authorName, content }) {
    // 1. Extract @mentions
    const mentions = [];
    const matches = content.match(MENTION_REGEX);

    if (matches) {
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
            user_id: mentionedUser._id,
            name: mentionedUser.name,
            email: mentionedUser.email,
          });
        }
      }
    }

    const note = await AgentNote.create({
      conversation_id: conversationId,
      author_id: authorId,
      author_name: authorName,
      content,
      mentions,
    });

    // 2. Broadcast real-time mention notification to mentioned users
    if (mentions.length > 0) {
      for (const mention of mentions) {
        emitEvent(`mention_${mention.user_id}`, {
          noteId: note._id,
          conversation_id: conversationId,
          authorName,
          content,
          created_at: note.created_at,
        });
      }
    }

    emitEvent('new_note', {
      conversation_id: conversationId,
      note,
    });

    logger.info(`[Note Service] Agent ${authorName} posted internal note on conversation ${conversationId}`);
    return note;
  },

  async deleteNote(noteId, authorId) {
    const note = await AgentNote.findOneAndDelete({ _id: noteId, author_id: authorId });
    if (note) {
      emitEvent('delete_note', { noteId, conversation_id: note.conversation_id });
    }
    return note;
  },
};

export default noteService;

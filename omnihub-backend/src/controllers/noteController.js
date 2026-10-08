import noteService from '../services/noteService.js';
import { AgentNote } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const noteController = {
  async getNotes(req, res, next) {
    try {
      const { conversationId } = req.params;
      const notes = await noteService.listNotes(conversationId);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, notes.map((n) => ({ ...n.toObject(), id: n._id })), 'Notes loaded.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async addNote(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;

      const note = await noteService.addNote({
        conversationId,
        authorId: req.user._id,
        authorName: req.user.name,
        content,
      });

      return res.status(HTTP_STATUS.CREATED).json(
        formatResponse(true, { ...note.toObject(), id: note._id }, 'Note added successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteNote(req, res, next) {
    try {
      const { noteId } = req.params;
      await noteService.deleteNote(noteId, req.user._id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, null, 'Note deleted.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async getMentionNotifications(req, res, next) {
    try {
      const notes = await AgentNote.find({
        'mentions.user_id': req.user._id,
      })
        .sort({ created_at: -1 })
        .limit(20)
        .lean();

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, notes, 'Mentions retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default noteController;

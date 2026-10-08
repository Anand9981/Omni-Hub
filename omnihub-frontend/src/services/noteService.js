import { demoStore } from './conversationService.js';

export const NOTE_TYPES = ['General note', 'Follow-up', 'Issue', 'Resolution', 'Escalation'];
const NOTIFICATIONS_KEY = 'omnihub.demo.noteNotifications';
const MAX_ATTACHMENT_BYTES = 1024 * 1024;

function readNotifications() {
  try {
    const value = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    if (!Array.isArray(value)) throw new Error('Note notifications must be a list.');
    return value;
  } catch (error) {
    console.error('Could not read note notifications.', error);
    throw new Error('Note notifications could not be loaded. Refresh the page to retry.');
  }
}

export const noteService = {
  listNotes(conversationId) {
    demoStore.ensureSeed();
    return demoStore.notes()
      .filter((note) => note.conversation_id === conversationId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  listMentionNotifications(agentId) {
    if (!agentId) return [];
    return readNotifications().filter((item) => item.agent_id === agentId);
  },

  addNote({ conversationId, text, authorName, authorId, type, assignedAgentId, mentions, attachments }) {
    demoStore.ensureSeed();
    const content = String(text || '').trim();
    if (!conversationId) throw new Error('Select a conversation before adding a note.');
    if (!content) throw new Error('Note content cannot be empty.');
    if (content.length > 2000) throw new Error('Notes must be 2,000 characters or fewer.');
    if (!NOTE_TYPES.includes(type)) throw new Error('Choose a valid note type.');
    if (!Array.isArray(mentions) || !Array.isArray(attachments)) throw new Error('Note collaborators or attachments are invalid.');
    attachments.forEach((file) => {
      if (!file.name || !file.dataUrl || file.size > MAX_ATTACHMENT_BYTES) {
        throw new Error('Attachments must be valid files no larger than 1 MB each.');
      }
    });

    const uniqueMentions = [...new Map(mentions
      .filter((mention) => mention.id && mention.id !== authorId && content.includes(`@${mention.name}`))
      .map((mention) => [mention.id, mention])).values()];
    const note = {
      id: demoStore.newId('note'),
      conversation_id: conversationId,
      author_id: authorId || null,
      author_name: authorName || 'You',
      text: content,
      type,
      assigned_agent_id: assignedAgentId || null,
      mentions: uniqueMentions,
      attachments,
      created_at: new Date().toISOString(),
      visibility: 'internal',
    };
    const notes = demoStore.notes();
    demoStore.saveNotes([note, ...notes]);

    if (uniqueMentions.length) {
      const notifications = readNotifications();
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([
        ...uniqueMentions.map((mention) => ({
          id: demoStore.newId('mention'),
          note_id: note.id,
          conversation_id: conversationId,
          agent_id: mention.id,
          author_name: note.author_name,
          created_at: note.created_at,
          read: false,
        })),
        ...notifications,
      ]));
    }
    return note;
  },

  deleteNote({ conversationId, noteId }) {
    demoStore.ensureSeed();
    const notes = demoStore.notes();
    if (!notes.some((note) => note.id === noteId && note.conversation_id === conversationId)) {
      throw new Error('That note could not be found in this conversation.');
    }
    demoStore.saveNotes(notes.filter((note) => note.id !== noteId));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(
      readNotifications().filter((item) => item.note_id !== noteId),
    ));
    return this.listNotes(conversationId);
  },
};

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { noteService } from '../services/noteService.js';

export const loadNotes = createAsyncThunk('notes/load', async (conversationId) => ({
  conversationId,
  items: await noteService.listNotes(conversationId),
}));

export const loadMentionNotifications = createAsyncThunk(
  'notes/loadMentionNotifications',
  async (agentId) => await noteService.listMentionNotifications(agentId),
);

export const addNote = createAsyncThunk('notes/add', async (note) => {
  await noteService.addNote(note);
  return { conversationId: note.conversationId, items: await noteService.listNotes(note.conversationId) };
});

export const deleteNote = createAsyncThunk('notes/delete', async (payload) => ({
  conversationId: payload.conversationId,
  items: await noteService.deleteNote(payload),
}));

const initialState = {
  items: [],
  conversationId: null,
  notifications: [],
  status: 'idle',
  error: null,
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNoteError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotes.pending, (state, action) => {
        if (state.conversationId !== action.meta.arg) state.items = [];
        state.conversationId = action.meta.arg;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadNotes.fulfilled, (state, action) => {
        if (state.conversationId !== action.payload.conversationId) return;
        state.items = action.payload.items;
        state.status = 'ready';
      })
      .addCase(loadNotes.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.conversationId = action.payload.conversationId;
        state.items = action.payload.items;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.conversationId = action.payload.conversationId;
        state.items = action.payload.items;
        state.error = null;
      })
      .addCase(loadMentionNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addMatcher(
        (action) => (action.type === addNote.rejected.type || action.type === deleteNote.rejected.type),
        (state, action) => {
          state.error = action.error.message;
        },
      );
  },
});

export const { clearNoteError } = noteSlice.actions;
export default noteSlice.reducer;

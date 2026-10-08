import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { approvalService } from '../services/approvalService.js';
import { aiService } from '../services/aiService.js';

/* ------------------------------------------------------------
   Approvals - the held-draft queue (PRD 9.2 / 9.3).
   ------------------------------------------------------------ */

export const loadApprovals = createAsyncThunk('approvals/load', async () => ({
  pending: approvalService.listPending(),
  resolved: approvalService.listResolved(),
}));

export const approveDraft = createAsyncThunk('approvals/approve', async ({ approvalId, text }) => {
  approvalService.approve(approvalId, text);
  return { pending: approvalService.listPending(), resolved: approvalService.listResolved() };
});

export const rejectDraft = createAsyncThunk('approvals/reject', async ({ approvalId, reason }) => {
  approvalService.reject(approvalId, reason);
  return { pending: approvalService.listPending(), resolved: approvalService.listResolved() };
});

export const saveDraftEdit = createAsyncThunk('approvals/edit', async ({ approvalId, text }) => {
  approvalService.edit(approvalId, text);
  return { pending: approvalService.listPending(), resolved: approvalService.listResolved() };
});

/** PRD 9.3 - [Polish with AI] rewrites a rough note in its detected language. */
export const polishDraft = createAsyncThunk(
  'approvals/polish',
  async ({ text, language }) => aiService.polish(text, { language }),
);

const initialState = {
  pending: [],
  resolved: [],
  status: 'idle',
  error: null,
  notice: null,
  /** Row currently being edited inline. */
  editingId: null,
  /** Row with an in-flight approve/reject, for button spinners. */
  busyId: null,
  polish: { status: 'idle', result: null, error: null },
};

const approvalSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    startEditing(state, action) {
      state.editingId = action.payload;
      state.polish = initialState.polish;
    },
    stopEditing(state) {
      state.editingId = null;
      state.polish = initialState.polish;
    },
    setNotice(state, action) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = null;
    },
    /** Socket event: pending_approval - a fresh draft arrived. */
    receivePending(state, action) {
      const draft = action.payload;
      if (state.pending.some((item) => item.id === draft.id)) return;
      state.pending = [...state.pending, draft];
    },
    resetPolish(state) {
      state.polish = initialState.polish;
    },
  },
  extraReducers: (builder) => {
    const apply = (state, action) => {
      state.pending = action.payload.pending;
      state.resolved = action.payload.resolved;
      state.busyId = null;
      state.editingId = null;
      state.polish = initialState.polish;
    };

    builder
      .addCase(loadApprovals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadApprovals.fulfilled, (state, action) => {
        state.pending = action.payload.pending;
        state.resolved = action.payload.resolved;
        state.status = 'ready';
      })
      .addCase(loadApprovals.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(approveDraft.pending, (state, action) => {
        state.busyId = action.meta.arg.approvalId;
        state.error = null;
      })
      .addCase(approveDraft.fulfilled, (state, action) => {
        apply(state, action);
        state.notice = 'Draft approved and sent.';
      })
      .addCase(approveDraft.rejected, (state, action) => {
        state.busyId = null;
        state.error = action.error.message;
      })
      .addCase(rejectDraft.pending, (state, action) => {
        state.busyId = action.meta.arg.approvalId;
        state.error = null;
      })
      .addCase(rejectDraft.fulfilled, (state, action) => {
        apply(state, action);
        state.notice = 'Draft rejected. Nothing was sent.';
      })
      .addCase(rejectDraft.rejected, (state, action) => {
        state.busyId = null;
        state.error = action.error.message;
      })
      .addCase(saveDraftEdit.fulfilled, (state, action) => {
        apply(state, action);
        state.notice = 'Draft updated.';
      })
      .addCase(polishDraft.pending, (state) => {
        state.polish = { status: 'loading', result: null, error: null };
      })
      .addCase(polishDraft.fulfilled, (state, action) => {
        state.polish = { status: 'ready', result: action.payload, error: null };
      })
      .addCase(polishDraft.rejected, (state, action) => {
        state.polish = { status: 'error', result: null, error: action.error.message };
      });
  },
});

export const { startEditing, stopEditing, setNotice, clearNotice, receivePending, resetPolish } = approvalSlice.actions;

export default approvalSlice.reducer;
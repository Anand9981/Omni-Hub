import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { leadService } from '../services/leadService.js';

export const loadLeads = createAsyncThunk('leads/load', async () => leadService.listLeads());

export const updateLead = createAsyncThunk(
  'leads/update',
  async ({ leadId, updates }) => leadService.updateLead(leadId, updates),
);

export const updateConversationLead = createAsyncThunk(
  'leads/updateConversation',
  async ({ conversationId, updates }) => leadService.updateLeadForConversation(conversationId, updates),
);

const initialState = { items: [], status: 'idle', error: null, lastUpdatedAt: null };

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearLeadError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLeads.pending, (state) => {
        state.status = state.items.length ? 'ready' : 'loading';
        state.error = null;
      })
      .addCase(loadLeads.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
        state.error = null;
        state.lastUpdatedAt = new Date().toISOString();
      })
      .addCase(loadLeads.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
        state.lastUpdatedAt = new Date().toISOString();
      })
      .addCase(updateConversationLead.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
        state.lastUpdatedAt = new Date().toISOString();
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateConversationLead.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { clearLeadError } = leadSlice.actions;
export default leadSlice.reducer;

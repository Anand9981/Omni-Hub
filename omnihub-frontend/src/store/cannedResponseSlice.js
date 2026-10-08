import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cannedResponseService } from '../services/cannedResponseService.js';

export const loadCannedResponses = createAsyncThunk(
  'cannedResponses/load',
  async () => cannedResponseService.listResponses(),
);

export const saveCannedResponse = createAsyncThunk(
  'cannedResponses/save',
  async (response) => cannedResponseService.saveResponse(response),
);

export const deleteCannedResponse = createAsyncThunk(
  'cannedResponses/delete',
  async (responseId) => cannedResponseService.deleteResponse(responseId),
);

export const toggleCannedResponseFavorite = createAsyncThunk(
  'cannedResponses/toggleFavorite',
  async (responseId) => cannedResponseService.toggleFavorite(responseId),
);

export const useCannedResponse = createAsyncThunk(
  'cannedResponses/use',
  async ({ responseId, variables }) => cannedResponseService.recordUsage(responseId, variables),
);

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  lastUsedId: null,
};

const cannedResponseSlice = createSlice({
  name: 'cannedResponses',
  initialState,
  reducers: {
    clearCannedResponseError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCannedResponses.pending, (state) => {
        state.status = state.items.length ? 'ready' : 'loading';
        state.error = null;
      })
      .addCase(loadCannedResponses.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(loadCannedResponses.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(saveCannedResponse.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })
      .addCase(deleteCannedResponse.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })
      .addCase(toggleCannedResponseFavorite.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })
      .addCase(useCannedResponse.fulfilled, (state, action) => {
        state.items = action.payload.responses;
        state.lastUsedId = action.meta.arg.responseId;
        state.error = null;
      })
      .addCase(saveCannedResponse.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteCannedResponse.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(toggleCannedResponseFavorite.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(useCannedResponse.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { clearCannedResponseError } = cannedResponseSlice.actions;
export default cannedResponseSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { templateService } from '../services/templateService.js';

export const loadTemplates = createAsyncThunk(
  'templates/load',
  async (_, { rejectWithValue }) => {
    try {
      return templateService.listTemplates();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const saveTemplate = createAsyncThunk(
  'templates/save',
  async (template, { rejectWithValue }) => {
    try {
      return templateService.saveTemplate(template);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const submitTemplate = createAsyncThunk(
  'templates/submit',
  async (templateId, { rejectWithValue }) => {
    try {
      return templateService.submitTemplate(templateId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async (templateId, { rejectWithValue }) => {
    try {
      return templateService.deleteTemplate(templateId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  items: [],
  status: 'idle',
  saving: false,
  submittingId: null,
  deletingId: null,
  error: null,
};

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearTemplateError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Load
      .addCase(loadTemplates.pending, (state) => {
        state.status = state.items.length ? 'ready' : 'loading';
        state.error = null;
      })
      .addCase(loadTemplates.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(loadTemplates.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? action.error.message;
      })
      // Save (create or update)
      .addCase(saveTemplate.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveTemplate.fulfilled, (state, action) => {
        state.items = action.payload;
        state.saving = false;
        state.error = null;
      })
      .addCase(saveTemplate.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? action.error.message;
      })
      // Submit for Meta review
      .addCase(submitTemplate.pending, (state, action) => {
        state.submittingId = action.meta.arg;
        state.error = null;
      })
      .addCase(submitTemplate.fulfilled, (state, action) => {
        state.items = action.payload;
        state.submittingId = null;
        state.error = null;
      })
      .addCase(submitTemplate.rejected, (state, action) => {
        state.submittingId = null;
        state.error = action.payload ?? action.error.message;
      })
      // Delete
      .addCase(deleteTemplate.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.items = action.payload;
        state.deletingId = null;
        state.error = null;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearTemplateError } = templateSlice.actions;
export default templateSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { businessHoursService } from '../services/businessHoursService.js';

export const loadBusinessHours = createAsyncThunk(
  'businessHours/load',
  async () => businessHoursService.getSettings(),
);

export const saveBusinessHours = createAsyncThunk(
  'businessHours/save',
  async (settings) => businessHoursService.saveSettings(settings),
);

const initialState = { settings: null, status: 'idle', saving: false, error: null, savedAt: null };

const businessHoursSlice = createSlice({
  name: 'businessHours',
  initialState,
  reducers: {
    clearBusinessHoursError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessHours.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loadBusinessHours.fulfilled, (state, action) => { state.settings = action.payload; state.status = 'ready'; })
      .addCase(loadBusinessHours.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message; })
      .addCase(saveBusinessHours.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(saveBusinessHours.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.saving = false;
        state.savedAt = new Date().toISOString();
      })
      .addCase(saveBusinessHours.rejected, (state, action) => { state.saving = false; state.error = action.error.message; });
  },
});

export const { clearBusinessHoursError } = businessHoursSlice.actions;
export default businessHoursSlice.reducer;

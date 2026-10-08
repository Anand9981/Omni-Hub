import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyticsService } from '../services/analyticsService.js';

export const loadAnalytics = createAsyncThunk(
  'analytics/load',
  async (params = {}) => analyticsService.getDashboard(params),
);

const initialState = {
  data: null,
  range: 'today',
  startDate: '',
  endDate: '',
  status: 'idle',
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalyticsRange(state, action) {
      state.range = action.payload.range;
      state.startDate = action.payload.startDate || '';
      state.endDate = action.payload.endDate || '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAnalytics.pending, (state) => {
        state.status = state.data ? 'refreshing' : 'loading';
        state.error = null;
      })
      .addCase(loadAnalytics.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(loadAnalytics.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      });
  },
});

export const { setAnalyticsRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;

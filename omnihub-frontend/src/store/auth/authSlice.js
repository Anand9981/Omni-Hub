import { createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/authDemoService.js';
import {
  loginUser,
  logoutUser,
  registerUser,
  revokeUserSession,
  verifyUserOtp,
} from './authThunks.js';

function getInitialAuthState() {
  try {
    const user = authService.getCurrentUser();
    const sessions = authService.getSessions();
    const pendingLogin = authService.getPendingLogin();
    return {
      user: user || null,
      sessions: Array.isArray(sessions) ? sessions : [],
      pendingLogin: pendingLogin || null,
      status: 'idle',
      error: null,
    };
  } catch {
    return {
      user: null,
      sessions: [],
      pendingLogin: null,
      status: 'idle',
      error: null,
    };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    syncCurrentUser(state) {
      state.user = authService.getCurrentUser() || null;
      state.sessions = authService.getSessions() || [];
      state.pendingLogin = authService.getPendingLogin() || null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload?.trustedBypass) {
          state.user = authService.getCurrentUser();
          state.sessions = authService.getSessions();
          state.pendingLogin = null;
        } else {
          state.pendingLogin = authService.getPendingLogin();
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(verifyUserOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyUserOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.sessions = action.payload.sessions;
        state.pendingLogin = null;
      })
      .addCase(verifyUserOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.pendingLogin = null;
        state.sessions = authService.getSessions();
        state.status = 'idle';
      })
      .addCase(revokeUserSession.fulfilled, (state, action) => {
        state.sessions = action.payload.sessions;
        state.user = action.payload.user;
      });
  },
});

export const { syncCurrentUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;


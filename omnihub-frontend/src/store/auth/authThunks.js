import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authDemoService.js';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      return await authService.login({ email, password, rememberMe });
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to sign in.');
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      return await authService.register({ name, email, password });
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed.');
    }
  },
);

export const verifyUserOtp = createAsyncThunk(
  'auth/verifyUserOtp',
  async ({ code, rememberDevice = true, isBackupCode = false }, { rejectWithValue }) => {
    try {
      const session = isBackupCode
        ? await authService.verifyBackupCode(code, rememberDevice)
        : await authService.verifyOtp(code, rememberDevice);
      return {
        user: authService.getCurrentUser() || session,
        sessions: authService.getSessions(),
      };
    } catch (error) {
      return rejectWithValue(error.message || 'OTP verification failed.');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return null;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to sign out.');
  }
});

export const revokeUserSession = createAsyncThunk(
  'auth/revokeUserSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const updated = authService.revokeSession(sessionId);
      return {
        sessions: updated,
        user: authService.getCurrentUser(),
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Could not revoke session.');
    }
  },
);

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authDemoService.js';
import { clearAuthError, syncCurrentUser } from '../store/auth/authSlice.js';
import {
  loginUser,
  logoutUser,
  registerUser,
  revokeUserSession,
  verifyUserOtp,
} from '../store/auth/authThunks.js';

/**
 * Unified authentication hook providing access to current user session,
 * active device sessions, and auth actions.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth) || {};
  const currentUser = authState.user || authService.getCurrentUser();

  const login = useCallback(
    (credentials) => dispatch(loginUser(credentials)).unwrap(),
    [dispatch],
  );

  const register = useCallback(
    (payload) => dispatch(registerUser(payload)).unwrap(),
    [dispatch],
  );

  const verifyOtp = useCallback(
    (code, rememberDevice = true, isBackupCode = false) =>
      dispatch(verifyUserOtp({ code, rememberDevice, isBackupCode })).unwrap(),
    [dispatch],
  );

  const logout = useCallback(() => dispatch(logoutUser()).unwrap(), [dispatch]);

  const revokeSession = useCallback(
    (sessionId) => dispatch(revokeUserSession(sessionId)).unwrap(),
    [dispatch],
  );

  const refreshAuth = useCallback(() => {
    dispatch(syncCurrentUser());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    user: currentUser,
    isAuthenticated: Boolean(currentUser),
    sessions: authState.sessions?.length ? authState.sessions : authService.getSessions(),
    pendingLogin: authState.pendingLogin || authService.getPendingLogin(),
    status: authState.status || 'idle',
    error: authState.error || null,
    login,
    register,
    verifyOtp,
    logout,
    revokeSession,
    refreshAuth,
    clearError,
  };
}

export default useAuth;

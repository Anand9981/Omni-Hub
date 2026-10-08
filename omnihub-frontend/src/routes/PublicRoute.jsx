import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/authDemoService.js';

/**
 * Guard for auth entry pages (login, register, password recovery).
 * Signed-in users are sent back into the workspace instead of seeing the
 * sign-in screens again.
 */
export default function PublicRoute() {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) return <Outlet />;

  const requested = location.state?.from?.pathname;
  return <Navigate to={requested || '/security'} replace />;
}

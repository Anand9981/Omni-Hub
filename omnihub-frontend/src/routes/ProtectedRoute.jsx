import { useCallback } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authDemoService.js';
import useIdleTimer from '../hooks/useIdleTimer.js';

export default function ProtectedRoute() {
  const location = useLocation();
  const user = authService.getCurrentUser();
  return user ? <ProtectedContent /> : <Navigate to="/login" replace state={{ from: location }} />;
}

function ProtectedContent() {
  const navigate = useNavigate();
  const onIdle = useCallback(() => {
    authService.signOut();
    navigate('/login', { replace: true, state: { sessionExpired: true } });
  }, [navigate]);
  useIdleTimer(onIdle);
  return <Outlet />;
}
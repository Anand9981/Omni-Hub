import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authDemoService.js';

export default function RoleRoute({ allowedRoles }) {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/security" replace />;
}
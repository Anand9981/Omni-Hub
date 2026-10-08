import { Navigate } from 'react-router-dom';
import AIContextForm from '../../components/settings/AIContextForm.jsx';
import { authService } from '../../services/authDemoService.js';
import { canManageApprovals } from '../../utils/permissions.js';

export default function AIContext() {
  const role = authService.getCurrentUser()?.role;
  if (!canManageApprovals(role)) return <Navigate replace to="/dashboard" />;
  return <AIContextForm />;
}

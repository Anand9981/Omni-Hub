import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import MinimalLayout from '../components/layout/MinimalLayout.jsx';
import Approvals from '../pages/dashboard/Approvals.jsx';
import AgentDetail from '../pages/agents/AgentDetail.jsx';
import AgentsList from '../pages/agents/AgentsList.jsx';
import LeadsList from '../pages/leads/LeadsList.jsx';
import CannedResponses from '../pages/settings/CannedResponses.jsx';
import BusinessHours from '../pages/settings/BusinessHours.jsx';
import AIContext from '../pages/settings/AIContext.jsx';
import WidgetCustomizer from '../pages/settings/WidgetCustomizer.jsx';
import WidgetPage from '../pages/widget/WidgetPage.jsx';
import Templates from '../pages/settings/Templates.jsx';
import Billing from '../pages/settings/Billing.jsx';
import Subscription from '../pages/settings/Subscription.jsx';
import OnboardingWizard from '../pages/onboarding/OnboardingWizard.jsx';
import Channels from '../pages/settings/Channels.jsx';
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Analytics from '../pages/analytics/Analytics.jsx';
import Reports from '../pages/analytics/Reports.jsx';
import BackupCodes from '../pages/auth/BackupCodes.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import SecurityHome from '../pages/auth/SecurityHome.jsx';
import SessionsManager from '../pages/auth/SessionsManager.jsx';
import VerifyEmail from '../pages/auth/VerifyEmail.jsx';
import VerifyOTP from '../pages/auth/VerifyOTP.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

/**
 * Route table, grouped by the shell each screen belongs to.
 *
 * - AuthLayout      marketing split  -> sign in, create account
 * - MinimalLayout   focused single column -> verify email, OTP, password recovery
 * - DashboardLayout authenticated workspace -> messaging dashboard and account area
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public - product split shell */}
      <Route element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Public - focused single-purpose shell */}
      <Route element={<MinimalLayout />}>
        <Route element={<PublicRoute />}>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      <Route path="/widget" element={<WidgetPage />} />

      {/* Authenticated - workspace shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:conversationId" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route element={<RoleRoute allowedRoles={['Super Admin', 'Admin']} />}>
            <Route path="/agents" element={<AgentsList />} />
            <Route path="/agents/:agentId" element={<AgentDetail />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['Super Admin', 'Admin', 'Agent', 'Viewer']} />}>
            <Route path="/leads" element={<LeadsList />} />
            <Route path="/canned-responses" element={<CannedResponses />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['Super Admin', 'Admin']} />}>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/business-hours" element={<BusinessHours />} />
            <Route path="/ai-context" element={<AIContext />} />
            <Route path="/widget-settings" element={<WidgetCustomizer />} />
            <Route path="/templates" element={<Templates />} />
          </Route>
          <Route path="/security" element={<SecurityHome />} />
          <Route path="/sessions" element={<SessionsManager />} />
          <Route path="/backup-codes" element={<BackupCodes />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
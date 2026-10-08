# OmniHub Frontend — Full File Structure

**Root Location:** `omnihub-frontend/`  
**Last Updated:** Current Version

---

```text
omnihub-frontend/
├── .clineignore
├── index.html
├── package.json
├── vite.config.js
├── _backup/
│   ├── index.html.bak
│   └── styles.legacy.bak.css
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── components/
    │   ├── agents/
    │   │   ├── AgentCard.jsx
    │   │   ├── AgentPerformance.jsx
    │   │   └── AgentStatusBadge.jsx
    │   ├── analytics/
    │   │   ├── BarChart.jsx
    │   │   ├── DateRangePicker.jsx
    │   │   ├── DonutChart.jsx
    │   │   ├── ExportButton.jsx
    │   │   ├── KpiCard.jsx
    │   │   ├── LineChart.jsx
    │   │   ├── PlatformTable.jsx
    │   │   └── StackedChart.jsx
    │   ├── auth/
    │   │   ├── BackupCodeCard.jsx
    │   │   ├── OTPInput.jsx
    │   │   ├── PasswordInput.jsx
    │   │   ├── PasswordStrength.jsx
    │   │   ├── ResendTimer.jsx
    │   │   ├── SessionCard.jsx
    │   │   └── TwoFASetupCard.jsx
    │   ├── dashboard/
    │   │   ├── AdvancedFilters.jsx
    │   │   ├── AIPolishButton.jsx
    │   │   ├── ApprovalCard.jsx
    │   │   ├── AssignAgentModal.jsx
    │   │   ├── AutoPilotToggle.jsx
    │   │   ├── ButtonRenderer.jsx
    │   │   ├── CenterPanel.jsx
    │   │   ├── ChannelBadge.jsx
    │   │   ├── ChatBubble.jsx
    │   │   ├── DeliveryFailureBadge.jsx
    │   │   ├── FilterTabs.jsx
    │   │   ├── LeadSidebar.jsx
    │   │   ├── LeftPanel.jsx
    │   │   ├── MenuBuilder.jsx
    │   │   ├── MessageInput.jsx
    │   │   ├── MessageStatusIcon.jsx
    │   │   ├── QuickReplyMenu.jsx
    │   │   ├── RightPanel.jsx
    │   │   ├── SavedSearches.jsx
    │   │   └── SearchBar.jsx
    │   ├── layout/
    │   │   ├── AuthLayout.jsx
    │   │   ├── DashboardLayout.jsx
    │   │   ├── Footer.jsx
    │   │   ├── MinimalLayout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Topbar.jsx
    │   ├── leads/
    │   │   ├── LeadCard.jsx
    │   │   ├── LeadStatusBadge.jsx
    │   │   └── LeadTags.jsx
    │   ├── notes/
    │   │   ├── MentionInput.jsx
    │   │   ├── NoteCard.jsx
    │   │   └── NotesList.jsx
    │   └── settings/
    │       ├── AwayMessageForm.jsx
    │       ├── BusinessHoursForm.jsx
    │       ├── CannedResponseForm.jsx
    │       ├── HolidayModeToggle.jsx
    │       ├── TemplateForm.jsx
    │       ├── TemplatePreview.jsx
    │       └── TemplateStatusBadge.jsx
    ├── context/
    │   ├── NotificationContext.jsx
    │   ├── SocketContext.jsx
    │   └── ThemeContext.jsx
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useIdleTimer.js
    │   ├── useOTPTimer.js
    │   └── usePasswordStrength.js
    ├── pages/
    │   ├── agents/
    │   │   ├── AgentDetail.jsx
    │   │   └── AgentsList.jsx
    │   ├── analytics/
    │   │   ├── Analytics.jsx
    │   │   └── Reports.jsx
    │   ├── auth/
    │   │   ├── BackupCodes.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── SecurityHome.jsx
    │   │   ├── SessionsManager.jsx
    │   │   ├── VerifyEmail.jsx
    │   │   └── VerifyOTP.jsx
    │   ├── dashboard/
    │   │   ├── Approvals.jsx
    │   │   ├── ConversationView.jsx
    │   │   └── Dashboard.jsx
    │   ├── leads/
    │   │   └── LeadsList.jsx
    │   ├── onboarding/
    │   │   ├── ChannelConnect.jsx
    │   │   ├── KnowledgeBase.jsx
    │   │   └── OnboardingWizard.jsx
    │   ├── settings/
    │   │   ├── AIContext.jsx
    │   │   ├── Billing.jsx
    │   │   ├── BusinessHours.jsx
    │   │   ├── CannedResponses.jsx
    │   │   ├── Channels.jsx
    │   │   ├── Subscription.jsx
    │   │   ├── Templates.jsx
    │   │   └── WidgetCustomizer.jsx
    │   └── widget/
    │       └── WidgetPage.jsx
    ├── routes/
    │   ├── AppRoutes.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── PublicRoute.jsx
    │   └── RoleRoute.jsx
    ├── services/
    │   ├── agentService.js
    │   ├── aiService.js
    │   ├── analyticsService.js
    │   ├── approvalService.js
    │   ├── authDemoService.js
    │   ├── authService.js
    │   ├── billingService.js
    │   ├── businessHoursService.js
    │   ├── cannedResponseService.js
    │   ├── conversationService.js
    │   ├── leadService.js
    │   ├── menuService.js
    │   ├── noteService.js
    │   ├── onboardingService.js
    │   ├── templateService.js
    │   └── widgetService.js
    ├── store/
    │   ├── agentSlice.js
    │   ├── analyticsSlice.js
    │   ├── approvalSlice.js
    │   ├── businessHoursSlice.js
    │   ├── cannedResponseSlice.js
    │   ├── conversationSlice.js
    │   ├── index.js
    │   ├── leadSlice.js
    │   ├── messageSlice.js
    │   ├── noteSlice.js
    │   ├── templateSlice.js
    │   └── auth/
    │       ├── authSlice.js
    │       └── authThunks.js
    └── utils/
        ├── chartColors.js
        ├── constants.js
        ├── deviceInfo.js
        ├── exportUtils.js
        ├── leadParsing.js
        ├── permissions.js
        ├── tokenStorage.js
        └── validators.js
```

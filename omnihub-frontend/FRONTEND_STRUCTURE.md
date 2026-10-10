# OmniHub Frontend — Current File Structure

**Root Location:** `omnihub-frontend/`  
**Last Updated:** 2026-10-10 | **Build Status:** Passing (`1818 modules`) | **Empty Files:** `0`

---

```text
omnihub-frontend/
├── .env
├── .env.example
├── .gitignore
├── FRONTEND_STRUCTURE.md
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── vite.config.js
├── public/
│   └── widget.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── api/
    │   └── axios.js                      # Central Axios client (Bearer JWT + refresh interceptor)
    ├── assets/
    │   ├── fonts/
    │   │   └── index.js
    │   ├── icons/
    │   │   └── index.js
    │   └── images/
    │       └── index.js
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
    │   ├── common/
    │   │   └── LiveToastContainer.jsx
    │   ├── dashboard/
    │   │   ├── AdvancedFilters.jsx
    │   │   ├── AIPolishButton.jsx
    │   │   ├── AISuggestionsBar.jsx
    │   │   ├── AISummarizeModal.jsx
    │   │   ├── ApprovalCard.jsx
    │   │   ├── AssignAgentModal.jsx
    │   │   ├── AutoPilotToggle.jsx
    │   │   ├── ButtonRenderer.jsx
    │   │   ├── CenterPanel.jsx
    │   │   ├── ChannelBadge.jsx
    │   │   ├── ChatBubble.jsx
    │   │   ├── DeliveryFailureBadge.jsx
    │   │   ├── FilterTabs.jsx
    │   │   ├── LanguageSelector.jsx
    │   │   ├── LeadSidebar.jsx
    │   │   ├── LeftPanel.jsx
    │   │   ├── MediaUpload.jsx
    │   │   ├── MenuBuilder.jsx
    │   │   ├── MenuPreview.jsx
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
    │   ├── onboarding/
    │   │   ├── HelpTooltip.jsx
    │   │   ├── ProgressBar.jsx
    │   │   └── StepIndicator.jsx
    │   ├── settings/
    │   │   ├── AIContextForm.jsx
    │   │   ├── AwayMessageForm.jsx
    │   │   ├── BusinessHoursForm.jsx
    │   │   ├── CannedResponseForm.jsx
    │   │   ├── HolidayModeToggle.jsx
    │   │   ├── TemplateForm.jsx
    │   │   ├── TemplatePreview.jsx
    │   │   └── TemplateStatusBadge.jsx
    │   └── widget/
    │       ├── ChatWidget.jsx
    │       ├── PreChatForm.jsx
    │       ├── TypingIndicator.jsx
    │       └── WidgetLauncher.jsx
    ├── context/
    │   ├── NotificationContext.jsx
    │   ├── SocketContext.jsx
    │   └── ThemeContext.jsx
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useDebounce.js
    │   ├── useIdleTimer.js
    │   ├── useLocalStorage.js
    │   ├── useMediaQuery.js
    │   ├── useOTPTimer.js
    │   ├── usePasswordStrength.js
    │   └── useSocket.js
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
    │   ├── agentService.js               # Connected to /api/dashboard/agents
    │   ├── aiService.js                  # Connected to /api/ai/* & /api/dashboard/ai-context
    │   ├── analyticsService.js           # Connected to /api/dashboard/analytics
    │   ├── approvalService.js            # Connected to /api/dashboard/approvals
    │   ├── authDemoService.js            # Connected to /api/auth/*
    │   ├── billingService.js             # Connected to /api/dashboard/billing/*
    │   ├── businessHoursService.js       # Connected to /api/dashboard/business-hours
    │   ├── cannedResponseService.js      # Connected to /api/dashboard/canned-responses
    │   ├── conversationService.js        # Connected to /api/dashboard/conversations & messages
    │   ├── leadService.js                # Connected to /api/dashboard/leads
    │   ├── menuService.js                # Connected to /api/dashboard/menus & media
    │   ├── noteService.js                # Connected to /api/dashboard/notes
    │   ├── onboardingService.js          # Connected to /api/dashboard/onboarding
    │   ├── templateService.js            # Connected to /api/dashboard/templates
    │   └── widgetService.js              # Connected to /api/dashboard/widget & /api/webhooks/website
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
        ├── formatters.js
        ├── leadParsing.js
        ├── permissions.js
        ├── socketEvents.js
        ├── tokenStorage.js
        └── validators.js
```

---

## File Counts Summary (`src/`)

| Layer | Files |
| :--- | :--- |
| Entry Points (`App.jsx`, `main.jsx`, `styles.css`) | 3 |
| API Client (`src/api/`) | 1 |
| Assets (`src/assets/`) | 3 |
| Components (`src/components/`) | 71 |
| Context Providers (`src/context/`) | 3 |
| Custom Hooks (`src/hooks/`) | 8 |
| Pages (`src/pages/`) | 29 |
| Route Guards (`src/routes/`) | 4 |
| API Services (`src/services/`) | 15 |
| Redux Store & Slices (`src/store/`) | 13 |
| Utilities (`src/utils/`) | 10 |
| **Total `src/` Files** | **160** |

# OmniHub Backend — Full File Structure

**Root Directory:** `omnihub-backend/`  
**Last Updated:** 2026-10-10 | **Empty Files:** `0`

---

```text
omnihub-backend/
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── lint.yml
│       └── test.yml
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
│
├── postman/
│   ├── OmniHub.postman_collection.json
│   └── OmniHub.postman_environment.json
│
├── scripts/
│   ├── backup.js
│   ├── healthcheck.js
│   ├── migrate.js
│   └── seed.js
│
├── src/
│   │
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── cors.js
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── helmet.js
│   │   ├── redis.js
│   │   ├── sentry.js
│   │   └── swagger.js
│   │
│   ├── controllers/
│   │   ├── agentController.js
│   │   ├── aiContextController.js
│   │   ├── aiController.js
│   │   ├── analyticsController.js
│   │   ├── approvalController.js
│   │   ├── authController.js
│   │   ├── billingController.js
│   │   ├── businessHoursController.js
│   │   ├── cannedResponseController.js
│   │   ├── channelController.js
│   │   ├── conversationController.js
│   │   ├── leadController.js
│   │   ├── mediaController.js
│   │   ├── menuController.js
│   │   ├── messageController.js
│   │   ├── noteController.js
│   │   ├── onboardingController.js
│   │   ├── subscriptionController.js
│   │   ├── teamController.js
│   │   ├── templateController.js
│   │   └── widgetController.js
│   │
│   ├── jobs/
│   │   ├── analyticsAggregator.js
│   │   ├── cleanup.js
│   │   ├── dailyReport.js
│   │   ├── queue.js
│   │   └── retryFailedMessages.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── contentFilter.js
│   │   ├── errorHandler.js
│   │   ├── httpsEnforce.js
│   │   ├── notFound.js
│   │   ├── rateLimiter.js
│   │   ├── requestLogger.js
│   │   ├── roleCheck.js
│   │   ├── sanitize.js
│   │   ├── upload.js
│   │   ├── validateRequest.js
│   │   └── validateWebhook.js
│   │
│   ├── models/
│   │   ├── AgentNote.js
│   │   ├── AIContext.js
│   │   ├── AuditLog.js
│   │   ├── BusinessHours.js
│   │   ├── CannedResponse.js
│   │   ├── ChannelConfig.js
│   │   ├── Conversation.js
│   │   ├── DailyAnalytics.js
│   │   ├── HourlyAnalytics.js
│   │   ├── index.js
│   │   ├── Invoice.js
│   │   ├── Lead.js
│   │   ├── MenuConfig.js
│   │   ├── Message.js
│   │   ├── OnboardingProgress.js
│   │   ├── PendingApproval.js
│   │   ├── Plan.js
│   │   ├── Session.js
│   │   ├── Subscription.js
│   │   ├── TeamInvite.js
│   │   ├── Template.js
│   │   ├── User.js
│   │   └── WidgetConfig.js
│   │
│   ├── routes/
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── index.js
│   │   ├── dashboard/
│   │   │   ├── agents.js
│   │   │   ├── aiContext.js
│   │   │   ├── analytics.js
│   │   │   ├── approvals.js
│   │   │   ├── billing.js
│   │   │   ├── businessHours.js
│   │   │   ├── cannedResponses.js
│   │   │   ├── channels.js
│   │   │   ├── conversations.js
│   │   │   ├── leads.js
│   │   │   ├── media.js
│   │   │   ├── menus.js
│   │   │   ├── messages.js
│   │   │   ├── notes.js
│   │   │   ├── onboarding.js
│   │   │   ├── subscription.js
│   │   │   ├── team.js
│   │   │   ├── templates.js
│   │   │   └── widget.js
│   │   └── webhooks/
│   │       ├── discord.js
│   │       ├── instagram.js
│   │       ├── linkedin.js
│   │       ├── telegram.js
│   │       ├── website.js
│   │       └── whatsapp.js
│   │
│   ├── services/
│   │   ├── agentService.js
│   │   ├── aiContextService.js
│   │   ├── aiService.js
│   │   ├── analyticsService.js
│   │   ├── approvalService.js
│   │   ├── authService.js
│   │   ├── autoPilotService.js
│   │   ├── billingService.js
│   │   ├── businessHoursService.js
│   │   ├── cannedResponseService.js
│   │   ├── channelService.js
│   │   ├── conversationService.js
│   │   ├── discordService.js
│   │   ├── dispatcher.js
│   │   ├── emailService.js
│   │   ├── leadExtractor.js
│   │   ├── leadParsingService.js
│   │   ├── mediaService.js
│   │   ├── menuService.js
│   │   ├── normalizer.js
│   │   ├── noteService.js
│   │   ├── onboardingService.js
│   │   ├── otpService.js
│   │   ├── sessionService.js
│   │   ├── subscriptionService.js
│   │   ├── teamService.js
│   │   ├── telegramService.js
│   │   ├── templateService.js
│   │   └── widgetService.js
│   │
│   ├── sockets/
│   │   ├── analyticsSocket.js
│   │   ├── authSocket.js
│   │   ├── conversationSocket.js
│   │   ├── events.js
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── audit.js
│   │   ├── cache.js
│   │   ├── constants.js
│   │   ├── errors.js
│   │   ├── helpers.js
│   │   ├── jwt.js
│   │   ├── leadParsing.js
│   │   ├── logger.js
│   │   ├── pagination.js
│   │   ├── password.js
│   │   ├── retry.js
│   │   ├── security.js
│   │   └── socketEvents.js
│   │
│   └── validators/
│       ├── agentValidator.js
│       ├── aiContextValidator.js
│       ├── analyticsValidator.js
│       ├── approvalValidator.js
│       ├── authValidator.js
│       ├── billingValidator.js
│       ├── businessHoursValidator.js
│       ├── cannedResponseValidator.js
│       ├── channelValidator.js
│       ├── conversationValidator.js
│       ├── leadValidator.js
│       ├── messageValidator.js
│       ├── noteValidator.js
│       ├── onboardingValidator.js
│       ├── subscriptionValidator.js
│       ├── templateValidator.js
│       ├── webhookValidator.js
│       └── widgetValidator.js
│
├── tests/
│   ├── e2e/
│   │   ├── analytics-flow.test.js
│   │   ├── approval-flow.test.js
│   │   ├── auth-flow.test.js
│   │   ├── conversation-flow.test.js
│   │   ├── dashboard-flow.test.js
│   │   ├── onboarding-flow.test.js
│   │   ├── otp-flow.test.js
│   │   └── webhook-flow.test.js
│   ├── integration/
│   │   ├── agent.test.js
│   │   ├── ai.test.js
│   │   ├── aiContext.test.js
│   │   ├── analytics.test.js
│   │   ├── approval.test.js
│   │   ├── auth.test.js
│   │   ├── billing.test.js
│   │   ├── businessHours.test.js
│   │   ├── cannedResponse.test.js
│   │   ├── channel.test.js
│   │   ├── conversation.test.js
│   │   ├── lead.test.js
│   │   ├── message.test.js
│   │   ├── note.test.js
│   │   ├── onboarding.test.js
│   │   ├── subscription.test.js
│   │   ├── template.test.js
│   │   ├── webhook.test.js
│   │   └── widget.test.js
│   └── unit/
│       ├── controllers/
│       ├── services/
│       └── utils/
│
├── logs/
│
├── .dockerignore
├── .env
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── BACKEND_STRUCTURE.md
├── CURRENT_BACKEND_STRUCTURE.md
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── nodemon.json
├── package-lock.json
├── package.json
├── README.md
└── swagger.json
```
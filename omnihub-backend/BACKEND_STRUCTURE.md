# OmniHub Backend — Approved Target File Structure

**Root Directory:** `omnihub-backend/`  
**Architecture Status:** Strictly Fixed (No alterations allowed)

---

```text
omnihub-backend/
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── test.yml
│       └── lint.yml
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── postman/
│   ├── OmniHub.postman_collection.json
│   └── OmniHub.postman_environment.json
│
├── scripts/
│   ├── seed.js
│   ├── migrate.js
│   ├── backup.js
│   └── healthcheck.js
│
├── src/
│   │
│   ├── server.js
│   ├── app.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── redis.js
│   │   ├── cloudinary.js
│   │   ├── env.js
│   │   ├── cors.js
│   │   ├── helmet.js
│   │   └── swagger.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── AuditLog.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── DailyAnalytics.js
│   │   ├── HourlyAnalytics.js
│   │   ├── PendingApproval.js
│   │   ├── Lead.js
│   │   ├── CannedResponse.js
│   │   ├── Template.js
│   │   ├── AgentNote.js
│   │   ├── BusinessHours.js
│   │   ├── Plan.js
│   │   ├── Subscription.js
│   │   ├── Invoice.js
│   │   ├── WidgetConfig.js
│   │   ├── OnboardingProgress.js
│   │   ├── ChannelConfig.js
│   │   └── AIContext.js
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── ai.js
│   │   ├── webhooks/
│   │   │   ├── telegram.js
│   │   │   ├── discord.js
│   │   │   ├── whatsapp.js
│   │   │   ├── instagram.js
│   │   │   ├── linkedin.js
│   │   │   └── website.js
│   │   └── dashboard/
│   │       ├── conversations.js
│   │       ├── messages.js
│   │       ├── approvals.js
│   │       ├── leads.js
│   │       ├── agents.js
│   │       ├── analytics.js
│   │       ├── notes.js
│   │       ├── cannedResponses.js
│   │       ├── templates.js
│   │       ├── businessHours.js
│   │       ├── channels.js
│   │       ├── billing.js
│   │       ├── subscription.js
│   │       ├── widget.js
│   │       ├── onboarding.js
│   │       └── aiContext.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── conversationController.js
│   │   ├── messageController.js
│   │   ├── approvalController.js
│   │   ├── analyticsController.js
│   │   ├── leadController.js
│   │   ├── agentController.js
│   │   ├── noteController.js
│   │   ├── cannedResponseController.js
│   │   ├── templateController.js
│   │   ├── businessHoursController.js
│   │   ├── channelController.js
│   │   ├── billingController.js
│   │   ├── subscriptionController.js
│   │   ├── widgetController.js
│   │   ├── onboardingController.js
│   │   ├── aiContextController.js
│   │   └── aiController.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── normalizer.js
│   │   ├── aiService.js
│   │   ├── aiContextService.js
│   │   ├── menuService.js
│   │   ├── mediaService.js
│   │   ├── analyticsService.js
│   │   ├── leadExtractor.js
│   │   ├── leadParsingService.js
│   │   ├── dispatcher.js
│   │   ├── emailService.js
│   │   ├── otpService.js
│   │   ├── sessionService.js
│   │   ├── approvalService.js
│   │   ├── channelService.js
│   │   ├── billingService.js
│   │   ├── subscriptionService.js
│   │   ├── widgetService.js
│   │   └── onboardingService.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   ├── rateLimiter.js
│   │   ├── validateWebhook.js
│   │   ├── validateRequest.js
│   │   ├── contentFilter.js
│   │   ├── upload.js
│   │   ├── requestLogger.js
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   │
│   ├── sockets/
│   │   ├── index.js
│   │   ├── authSocket.js
│   │   ├── events.js
│   │   ├── conversationSocket.js
│   │   └── analyticsSocket.js
│   │
│   ├── jobs/
│   │   ├── dailyReport.js
│   │   ├── analyticsAggregator.js
│   │   ├── retryFailedMessages.js
│   │   ├── cleanup.js
│   │   └── queue.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── security.js
│   │   ├── jwt.js
│   │   ├── password.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   ├── socketEvents.js
│   │   └── leadParsing.js
│   │
│   └── validators/
│       ├── authValidator.js
│       ├── conversationValidator.js
│       ├── analyticsValidator.js
│       ├── webhookValidator.js
│       ├── leadValidator.js
│       ├── noteValidator.js
│       ├── cannedResponseValidator.js
│       ├── templateValidator.js
│       ├── businessHoursValidator.js
│       ├── channelValidator.js
│       ├── billingValidator.js
│       └── widgetValidator.js
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── conversation.test.js
│   │   ├── analytics.test.js
│   │   └── webhook.test.js
│   └── e2e/
│       ├── auth-flow.test.js
│       └── dashboard-flow.test.js
│
├── logs/
│
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── nodemon.json
├── swagger.json
├── package.json
└── README.md
```
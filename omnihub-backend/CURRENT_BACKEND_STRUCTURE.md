# OmniHub Backend — Current Final Structure
> Last updated: 2026-10-04 | Test Suites: 74 ✅ | Tests: 84 ✅

---

## Root Files

```
omnihub-backend/
├── .dockerignore
├── .env
├── .env.example
├── BACKEND_STRUCTURE.md              ← Original reference spec
├── CURRENT_BACKEND_STRUCTURE.md      ← This file (actual current state)
├── Dockerfile
├── README.md
├── docker-compose.yml
├── jest.config.js
├── package.json
├── package-lock.json
└── swagger.json
```

---

## GitHub CI/CD Workflows

```
.github/
└── workflows/
    ├── deploy.yml                    ← Production deploy workflow
    ├── lint.yml                      ← ESLint check workflow
    └── test.yml                      ← Jest test runner workflow
```

---

## Documentation

```
docs/
├── API.md                            ← Full API endpoint reference
├── ARCHITECTURE.md                   ← System architecture guide
├── CONTRIBUTING.md                   ← Developer contribution guide
└── DEPLOYMENT.md                     ← Docker / cloud deployment guide
```

---

## Postman Collections

```
postman/
├── OmniHub.postman_collection.json   ← All API requests collection
└── OmniHub.postman_environment.json  ← Environment variables (dev/prod)
```

---

## Scripts

```
scripts/
├── backup.js                         ← MongoDB backup automation
├── healthcheck.js                    ← Docker HEALTHCHECK probe
├── migrate.js                        ← Schema migration runner
└── seed.js                           ← Database seeder (plans, admin)
```

---

## Source (`src/`)

### Entry Points

```
src/
├── server.js                         ← HTTP server, Socket.io, jobs bootstrap
└── app.js                            ← Express app, middleware, routes mount
```

---

### Config (7 files)

```
src/config/
├── cloudinary.js                     ← Cloudinary SDK init
├── cors.js                           ← CORS policy
├── db.js                             ← Mongoose connection
├── env.js                            ← dotenv loader + env object
├── helmet.js                         ← Helmet security headers
├── redis.js                          ← Upstash Redis client
└── swagger.js                        ← Swagger UI server + /api/docs mount
```

---

### Controllers (18 files)

```
src/controllers/
├── agentController.js
├── aiContextController.js
├── aiController.js
├── analyticsController.js
├── approvalController.js
├── authController.js
├── billingController.js
├── businessHoursController.js
├── cannedResponseController.js
├── channelController.js
├── conversationController.js
├── leadController.js
├── messageController.js
├── noteController.js
├── onboardingController.js
├── subscriptionController.js
├── templateController.js
└── widgetController.js
```

---

### Background Jobs

```
src/jobs/
├── analyticsAggregator.js            ← Hourly analytics rollup cron
├── cleanup.js                        ← Session/expired-data cleanup cron
├── dailyReport.js                    ← Daily summary report cron
├── queue.js                          ← Job queue manager
└── retryFailedMessages.js            ← Retry failed outbound messages cron
```

---

### Middleware (10 files)

```
src/middleware/
├── auth.js                           ← JWT protect middleware
├── contentFilter.js                  ← Input content filtering
├── errorHandler.js                   ← Global error handler
├── notFound.js                       ← 404 handler
├── rateLimiter.js                    ← Express rate limiter
├── requestLogger.js                  ← Morgan HTTP logger
├── roleCheck.js                      ← RBAC role guard
├── upload.js                         ← Cloudinary file upload
├── validateRequest.js                ← Joi/validator request body middleware
└── validateWebhook.js                ← Meta/Telegram/Website webhook verification
```

---

### Models (21 files)

```
src/models/
├── AgentNote.js
├── AIContext.js
├── AuditLog.js
├── BusinessHours.js
├── CannedResponse.js
├── ChannelConfig.js
├── Conversation.js
├── DailyAnalytics.js
├── HourlyAnalytics.js
├── Invoice.js
├── Lead.js
├── Message.js
├── OnboardingProgress.js
├── PendingApproval.js
├── Plan.js
├── Session.js
├── Subscription.js
├── Template.js
├── User.js
├── WidgetConfig.js
└── index.js                          ← Barrel export for all models
```

---

### Routes

```
src/routes/
├── index.js                          ← Central router (mounts all sub-routers)
├── ai.js                             ← /api/ai/*
├── auth.js                           ← /api/auth/*
│
├── dashboard/                        ← /api/dashboard/* (all protected)
│   ├── agents.js
│   ├── aiContext.js
│   ├── analytics.js
│   ├── approvals.js
│   ├── billing.js
│   ├── businessHours.js
│   ├── cannedResponses.js
│   ├── channels.js
│   ├── conversations.js
│   ├── leads.js
│   ├── messages.js
│   ├── notes.js
│   ├── onboarding.js
│   ├── subscription.js
│   ├── templates.js
│   └── widget.js
│
└── webhooks/                         ← /api/webhooks/* (public inbound)
    ├── discord.js
    ├── instagram.js
    ├── linkedin.js
    ├── telegram.js
    ├── website.js
    └── whatsapp.js
```

---

### Services (26 files)

```
src/services/
├── agentService.js
├── aiContextService.js
├── aiService.js                      ← Gemini AI integration
├── analyticsService.js
├── approvalService.js
├── authService.js
├── billingService.js
├── businessHoursService.js
├── cannedResponseService.js
├── channelService.js
├── conversationService.js
├── dispatcher.js                     ← Outbound message dispatcher
├── emailService.js
├── leadExtractor.js                  ← AI lead extraction from conversations
├── leadParsingService.js
├── mediaService.js                   ← Cloudinary media upload
├── menuService.js                    ← Interactive menu builder
├── normalizer.js                     ← Inbound message normalizer
├── noteService.js
├── onboardingService.js
├── otpService.js
├── sessionService.js
├── subscriptionService.js
├── templateService.js
└── widgetService.js
```

---

### Sockets

```
src/sockets/
├── analyticsSocket.js                ← Real-time analytics push
├── authSocket.js                     ← Socket auth middleware
├── conversationSocket.js             ← Conversation/message socket events
├── events.js                         ← Socket event name constants
└── index.js                          ← Socket.io server initialization
```

---

### Utils

```
src/utils/
├── constants.js                      ← App-wide enums (ROLES, PLATFORMS, etc.)
├── helpers.js                        ← formatResponse, generateUUID, sanitizeString
├── jwt.js                            ← signToken, verifyToken, signRefreshToken, verifyRefreshToken
├── leadParsing.js                    ← parseLeadTags, computeLeadScore
├── logger.js                         ← Winston logger
├── password.js                       ← hashPassword, comparePassword, validatePasswordStrength
├── security.js                       ← generateOTP, generateBackupCode, generateBackupCodes, hashString
└── socketEvents.js                   ← Socket.io event name map
```

---

### Validators (18 files)

```
src/validators/
├── agentValidator.js
├── aiContextValidator.js
├── analyticsValidator.js
├── approvalValidator.js
├── authValidator.js
├── billingValidator.js
├── businessHoursValidator.js
├── cannedResponseValidator.js
├── channelValidator.js
├── conversationValidator.js
├── leadValidator.js
├── messageValidator.js
├── noteValidator.js
├── onboardingValidator.js
├── subscriptionValidator.js
├── templateValidator.js
├── webhookValidator.js
└── widgetValidator.js
```

---

## Tests (`tests/`)

### Unit Tests — Services (24 files)

```
tests/unit/services/
├── agentService.test.js
├── aiContextService.test.js
├── aiService.test.js
├── analyticsService.test.js
├── approvalService.test.js
├── authService.test.js
├── billingService.test.js
├── businessHoursService.test.js
├── cannedResponseService.test.js
├── channelService.test.js
├── dispatcher.test.js
├── emailService.test.js
├── leadExtractor.test.js
├── leadParsingService.test.js
├── mediaService.test.js
├── menuService.test.js
├── normalizer.test.js
├── noteService.test.js
├── onboardingService.test.js
├── otpService.test.js
├── sessionService.test.js
├── subscriptionService.test.js
├── templateService.test.js
└── widgetService.test.js
```

### Unit Tests — Controllers (18 files)

```
tests/unit/controllers/
├── agentController.test.js
├── aiContextController.test.js
├── aiController.test.js
├── analyticsController.test.js
├── approvalController.test.js
├── authController.test.js
├── billingController.test.js
├── businessHoursController.test.js
├── cannedResponseController.test.js
├── channelController.test.js
├── conversationController.test.js
├── leadController.test.js
├── messageController.test.js
├── noteController.test.js
├── onboardingController.test.js
├── subscriptionController.test.js
├── templateController.test.js
└── widgetController.test.js
```

### Unit Tests — Utils (5 files)

```
tests/unit/utils/
├── helpers.test.js
├── jwt.test.js
├── leadParsing.test.js
├── password.test.js
└── security.test.js
```

### Integration Tests (19 files)

```
tests/integration/
├── agent.test.js
├── ai.test.js
├── aiContext.test.js
├── analytics.test.js
├── approval.test.js
├── auth.test.js
├── billing.test.js
├── businessHours.test.js
├── cannedResponse.test.js
├── channel.test.js
├── conversation.test.js
├── lead.test.js
├── message.test.js
├── note.test.js
├── onboarding.test.js
├── subscription.test.js
├── template.test.js
├── webhook.test.js
└── widget.test.js
```

### E2E Tests (8 files)

```
tests/e2e/
├── analytics-flow.test.js
├── approval-flow.test.js
├── auth-flow.test.js
├── conversation-flow.test.js
├── dashboard-flow.test.js
├── onboarding-flow.test.js
├── otp-flow.test.js
└── webhook-flow.test.js
```

---

## Test Suite Summary

| Category              | Suites | Tests |
|-----------------------|--------|-------|
| Unit — Services       | 24     | 24    |
| Unit — Controllers    | 18     | 18    |
| Unit — Utils          | 5      | 13    |
| Integration           | 19     | 20    |
| E2E                   | 8      | 8     |
| **Total**             | **74** | **84**|

> All 74 suites passing. Run with:
> ```bash
> node --experimental-vm-modules node_modules/jest/bin/jest.js --passWithNoTests
> ```

---

## File Counts Summary

| Layer         | Files |
|---------------|-------|
| Config        | 6     |
| Controllers   | 18    |
| Jobs          | 5     |
| Middleware    | 9     |
| Models        | 21    |
| Routes        | 25    |
| Services      | 25    |
| Sockets       | 5     |
| Utils         | 8     |
| Validators    | 18    |
| **Total src** | **140** |

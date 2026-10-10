# OmniHub Backend — Current Final Structure
> Last updated: 2026-10-10 | Test Suites: 74 ✅ | Empty Files: 0 ✅

---

## Root Files

```text
omnihub-backend/
├── .dockerignore
├── .env
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── BACKEND_STRUCTURE.md              ← Full tree reference
├── CURRENT_BACKEND_STRUCTURE.md      ← Detailed breakdown (this file)
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── nodemon.json
├── package-lock.json
├── package.json
├── README.md
└── swagger.json
```

---

## GitHub CI/CD Workflows

```text
.github/
└── workflows/
    ├── deploy.yml                    ← Production deploy workflow
    ├── lint.yml                      ← ESLint check workflow
    └── test.yml                      ← Jest test runner workflow
```

---

## Documentation

```text
docs/
├── API.md                            ← Full API endpoint reference
├── ARCHITECTURE.md                   ← System architecture & Mermaid diagrams
├── CONTRIBUTING.md                   ← Developer contribution guide
└── DEPLOYMENT.md                     ← Docker / cloud deployment guide
```

---

## Postman Collections

```text
postman/
├── OmniHub.postman_collection.json   ← All API requests collection
└── OmniHub.postman_environment.json  ← Environment variables (dev/prod)
```

---

## Scripts

```text
scripts/
├── backup.js                         ← MongoDB backup automation
├── healthcheck.js                    ← Docker HEALTHCHECK probe
├── migrate.js                        ← Schema migration runner
└── seed.js                           ← Database seeder (plans, admin)
```

---

## Source (`src/`)

### Entry Points (2 files)

```text
src/
├── app.js                            ← Express app, middleware, routes mount
└── server.js                         ← HTTP server, Socket.io, Discord/Telegram bots, jobs bootstrap
```

---

### Config (8 files)

```text
src/config/
├── cloudinary.js                     ← Cloudinary SDK init
├── cors.js                           ← CORS policy
├── db.js                             ← Mongoose MongoDB Atlas connection
├── env.js                            ← dotenv loader + validated env object
├── helmet.js                         ← Helmet security headers
├── redis.js                          ← Upstash Redis Cloud client
├── sentry.js                         ← Sentry error monitoring
└── swagger.js                        ← Swagger UI server + /api/docs mount
```

---

### Controllers (21 files)

```text
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
├── mediaController.js
├── menuController.js
├── messageController.js
├── noteController.js
├── onboardingController.js
├── subscriptionController.js
├── teamController.js
├── templateController.js
└── widgetController.js
```

---

### Background Jobs (5 files)

```text
src/jobs/
├── analyticsAggregator.js            ← Hourly analytics rollup cron
├── cleanup.js                        ← Session/expired-data cleanup cron
├── dailyReport.js                    ← Daily summary report cron
├── queue.js                          ← Job queue manager
└── retryFailedMessages.js            ← Retry failed outbound messages cron
```

---

### Middleware (12 files)

```text
src/middleware/
├── auth.js                           ← JWT protect middleware
├── contentFilter.js                  ← Input content filtering
├── errorHandler.js                   ← Global error handler
├── httpsEnforce.js                   ← Production HTTPS enforcement
├── notFound.js                       ← 404 handler
├── rateLimiter.js                    ← Express rate limiter
├── requestLogger.js                  ← Morgan HTTP logger
├── roleCheck.js                      ← RBAC role guard
├── sanitize.js                       ← NoSQL & XSS input sanitizer
├── upload.js                         ← Cloudinary file upload
├── validateRequest.js                ← Request body validation middleware
└── validateWebhook.js                ← Meta/Telegram/Website webhook verification
```

---

### Models (23 files)

```text
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
├── index.js                          ← Barrel export for all models
├── Invoice.js
├── Lead.js
├── MenuConfig.js
├── Message.js
├── OnboardingProgress.js
├── PendingApproval.js
├── Plan.js
├── Session.js
├── Subscription.js
├── TeamInvite.js
├── Template.js
├── User.js
└── WidgetConfig.js
```

---

### Routes (28 files)

```text
src/routes/
├── ai.js                             ← /api/ai/* (generate, polish, suggestions, summarize)
├── auth.js                           ← /api/auth/* (login, register, 2FA, sessions)
├── index.js                          ← Central router (mounts all sub-routers + aliases)
│
├── dashboard/                        ← /api/dashboard/* (protected operational routes)
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
│   ├── media.js
│   ├── menus.js
│   ├── messages.js
│   ├── notes.js
│   ├── onboarding.js
│   ├── subscription.js
│   ├── team.js
│   ├── templates.js
│   └── widget.js
│
└── webhooks/                         ← /api/webhooks/* (public inbound webhooks)
    ├── discord.js
    ├── instagram.js
    ├── linkedin.js
    ├── telegram.js
    ├── website.js
    └── whatsapp.js
```

---

### Services (29 files)

```text
src/services/
├── agentService.js
├── aiContextService.js
├── aiService.js                      ← Google Gemini AI integration
├── analyticsService.js
├── approvalService.js
├── authService.js
├── autoPilotService.js               ← Autonomous AI reply & approval routing
├── billingService.js
├── businessHoursService.js
├── cannedResponseService.js
├── channelService.js
├── conversationService.js
├── discordService.js                 ← Live Discord Gateway bot client
├── dispatcher.js                     ← Multi-channel outbound message dispatcher
├── emailService.js                   ← Gmail SMTP Nodemailer delivery
├── leadExtractor.js                  ← AI & Regex CRM lead extraction
├── leadParsingService.js
├── mediaService.js                   ← Cloudinary media upload & brochure attachments
├── menuService.js                    ← Interactive menu builder & traversal
├── normalizer.js                     ← Universal inbound message normalizer
├── noteService.js
├── onboardingService.js
├── otpService.js                     ← Redis/DB OTP generation & verification
├── sessionService.js
├── subscriptionService.js
├── teamService.js
├── telegramService.js                ← Live Telegram Bot polling & outbound dispatch
├── templateService.js
└── widgetService.js
```

---

### Sockets (5 files)

```text
src/sockets/
├── analyticsSocket.js                ← Real-time analytics push
├── authSocket.js                     ← Socket JWT auth middleware
├── conversationSocket.js             ← Conversation/message socket events
├── events.js                         ← Socket event name constants
└── index.js                          ← Socket.io server initialization
```

---

### Utils (13 files)

```text
src/utils/
├── audit.js                          ← Security audit logger
├── cache.js                          ← Redis / L1 memory cache helper
├── constants.js                      ← App-wide enums (ROLES, PLATFORMS, etc.)
├── errors.js                         ← Custom AppError classes
├── helpers.js                        ← formatResponse, generateUUID, sanitizeString
├── jwt.js                            ← signToken, verifyToken, signRefreshToken, verifyRefreshToken
├── leadParsing.js                    ← parseLeadTags, computeLeadScore
├── logger.js                         ← Winston logger
├── pagination.js                     ← Standard pagination helper
├── password.js                       ← hashPassword, comparePassword, validatePasswordStrength
├── retry.js                          ← Exponential backoff retry utility
├── security.js                       ← generateOTP, generateBackupCode, generateBackupCodes, hashString
└── socketEvents.js                   ← Socket.io event name map
```

---

### Validators (18 files)

```text
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

## Tests (`tests/` — 74 Suites)

- **Unit Tests — Services:** 24 files (`tests/unit/services/*.test.js`)
- **Unit Tests — Controllers:** 18 files (`tests/unit/controllers/*.test.js`)
- **Unit Tests — Utils:** 5 files (`tests/unit/utils/*.test.js`)
- **Integration Tests:** 19 files (`tests/integration/*.test.js`)
- **E2E Tests:** 8 files (`tests/e2e/*.test.js`)

---

## File Counts Summary (`src/`)

| Layer | Files |
| :--- | :--- |
| Entry Points (`app.js`, `server.js`) | 2 |
| Config (`src/config/`) | 8 |
| Controllers (`src/controllers/`) | 21 |
| Jobs (`src/jobs/`) | 5 |
| Middleware (`src/middleware/`) | 12 |
| Models (`src/models/`) | 23 |
| Routes (`src/routes/`) | 28 |
| Services (`src/services/`) | 29 |
| Sockets (`src/sockets/`) | 5 |
| Utils (`src/utils/`) | 13 |
| Validators (`src/validators/`) | 18 |
| **Total `src/` Files** | **164** |

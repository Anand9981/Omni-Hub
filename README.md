# 🌐 OmniHub — Omnichannel AI Customer Support Platform

OmniHub is a modern, enterprise-grade omnichannel customer support and engagement hub powered by **Google Gemini AI**. It seamlessly connects customer conversations from **Discord, Telegram, WhatsApp, Webchat, Instagram, and LinkedIn** into a unified real-time dashboard.

---

## 🚀 Key Features

* **Unified Omnichannel Inbox:** Two-way real-time conversation routing across Discord, Telegram, WhatsApp, and Website Live Chat.
* **Auto-Pilot Bot (Google Gemini):** Automated AI customer responses in natural language (Hindi, Hinglish, English) with brand FAQs, business hours, and tone awareness.
* **Smart Approvals Queue:** Hold AI drafts for human review (`MANUAL` mode) or dispatch immediately (`AUTO` mode).
* **AI Copilot & Insights:** 3 contextual smart reply suggestions, single-line draft polishing, automated sentiment & intent detection, and 1-click conversation summarization.
* **Interactive Menus & Media Dispatch:** Multi-level interactive button menus and automatic Cloudinary PDF/image brochure attachments.
* **Real-Time CRM & Lead Extraction:** Automatic contact & intent extraction (`#HOT_LEAD`, `#PRICING_INQUIRY`, `#VIP`), lead scoring, and internal team notes with `@mentions`.
* **Security & Session Management:** JWT authentication, Gmail SMTP 2FA OTP verification, emergency backup codes, and multi-device session revocation.
* **Full Operational Suite:** Support agent workload routing, canned responses (`/shortcut`), WhatsApp templates, business hours & holiday mode, website chat widget customizer, and subscription billing.

---

## 🛠️ Tech Stack

### Backend (`omnihub-backend`)
* **Runtime:** Node.js (ESM) + Express
* **Database & Cache:** MongoDB Atlas (Mongoose) + Upstash Redis Cloud
* **AI Engine:** Google Gemini API (`@google/genai`)
* **Real-time:** Socket.io
* **Media & Monitoring:** Cloudinary SDK, Sentry (`@sentry/node`), Winston
* **Integrations:** Discord.js, Telegram Bot API, Meta WhatsApp Cloud API, Nodemailer (Gmail SMTP)

### Frontend (`omnihub-frontend`)
* **Framework:** React 19 + Vite
* **State Management:** Redux Toolkit + React Context (`SocketContext`, `NotificationContext`, `ThemeContext`)
* **HTTP & Real-time:** Axios (with JWT refresh interceptor) + Socket.io Client
* **Styling & Icons:** Lucide React, Enterprise CSS Design System

---

## 📂 Project Structure (Frontend + Backend)

```text
Omni Hub/
├── omnihub-backend/                  # Node.js Express API Server, Webhooks & Real-time Engine
│   ├── .github/workflows/            # CI/CD workflows (deploy, lint, test)
│   ├── docs/                         # API.md, ARCHITECTURE.md, DEPLOYMENT.md, CONTRIBUTING.md
│   ├── postman/                      # Postman API collection & environment
│   ├── scripts/                      # seed.js, migrate.js, backup.js, healthcheck.js
│   ├── src/
│   │   ├── config/                   # MongoDB, Upstash Redis, Cloudinary, CORS, Helmet, Sentry, Swagger
│   │   ├── controllers/              # 21 Route Controllers (Auth, Conversations, AI, Leads, Agents, etc.)
│   │   ├── jobs/                     # Cron jobs (Analytics rollup, Daily report, Message retry, Cleanup)
│   │   ├── middleware/               # JWT Auth, RBAC, Rate Limiter, Webhook HMAC, Sanitizer, Upload
│   │   ├── models/                   # 23 Mongoose Schemas (User, Conversation, Message, Lead, etc.)
│   │   ├── routes/                   # Central router, /api/auth, /api/ai, /api/dashboard/*, /api/webhooks/*
│   │   ├── services/                 # 29 Services (Gemini AI, AutoPilot, Dispatcher, Discord, Telegram, SMTP)
│   │   ├── sockets/                  # Socket.io server & real-time room broadcasters
│   │   ├── utils/                    # Logger, JWT, Password, Security, Cache, Audit, Pagination
│   │   ├── validators/               # 18 Request & Webhook payload validators
│   │   ├── app.js                    # Express application setup
│   │   └── server.js                 # Server & bot bootstrap entry point
│   ├── tests/                        # 74 Jest Test Suites (unit, integration, e2e)
│   ├── BACKEND_STRUCTURE.md          # Complete backend file tree
│   ├── CURRENT_BACKEND_STRUCTURE.md  # Detailed backend layer breakdown
│   └── package.json
│
├── omnihub-frontend/                 # React 19 + Vite Operational Dashboard
│   ├── public/
│   │   └── widget.js                 # Embeddable Website Chat Widget loader script
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Central Axios instance with Bearer JWT & token refresh
│   │   ├── assets/                   # Fonts, icons, and image barrel exports
│   │   ├── components/
│   │   │   ├── agents/               # AgentCard, AgentPerformance, AgentStatusBadge
│   │   │   ├── analytics/            # BarChart, DonutChart, LineChart, StackedChart, KpiCard, etc.
│   │   │   ├── auth/                 # OTPInput, PasswordInput, BackupCodeCard, SessionCard, TwoFASetupCard
│   │   │   ├── common/               # LiveToastContainer
│   │   │   ├── dashboard/            # LeftPanel, CenterPanel, RightPanel, ChatBubble, AIPolishButton, etc.
│   │   │   ├── layout/               # DashboardLayout, AuthLayout, MinimalLayout, Sidebar, Topbar, Footer
│   │   │   ├── leads/                # LeadCard, LeadStatusBadge, LeadTags
│   │   │   ├── notes/                # NotesList, NoteCard, MentionInput
│   │   │   ├── onboarding/           # StepIndicator, ProgressBar, HelpTooltip
│   │   │   ├── settings/             # AIContextForm, BusinessHoursForm, CannedResponseForm, TemplateForm
│   │   │   └── widget/               # ChatWidget, PreChatForm, TypingIndicator, WidgetLauncher
│   │   ├── context/                  # SocketContext, NotificationContext, ThemeContext
│   │   ├── hooks/                    # useAuth, useSocket, useOTPTimer, usePasswordStrength, useIdleTimer, etc.
│   │   ├── pages/                    # 29 Pages (Dashboard, Approvals, Leads, Agents, Analytics, Auth, Settings)
│   │   ├── routes/                   # AppRoutes, ProtectedRoute, PublicRoute, RoleRoute
│   │   ├── services/                 # 15 Backend-connected API Services
│   │   ├── store/                    # Redux store + 12 slices & auth thunks
│   │   ├── utils/                    # Constants, Formatters, Validators, Permissions, TokenStorage, Export
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── FRONTEND_STRUCTURE.md         # Complete frontend file tree
│   └── package.json
│
├── .gitignore
└── README.md
```

> 📌 Full file-by-file trees are documented in:
> - **Frontend:** [`omnihub-frontend/FRONTEND_STRUCTURE.md`](./omnihub-frontend/FRONTEND_STRUCTURE.md)
> - **Backend:** [`omnihub-backend/BACKEND_STRUCTURE.md`](./omnihub-backend/BACKEND_STRUCTURE.md) & [`omnihub-backend/CURRENT_BACKEND_STRUCTURE.md`](./omnihub-backend/CURRENT_BACKEND_STRUCTURE.md)

---

## ⚙️ Getting Started

### 1. Backend Setup
```bash
cd omnihub-backend
npm install
cp .env.example .env     # Fill in your MongoDB, Redis, JWT, and API keys
npm run dev              # Runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd omnihub-frontend
npm install
npm run dev              # Runs on http://localhost:5173
```

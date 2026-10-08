# 🌐 OmniHub — Omnichannel AI Customer Support Platform

OmniHub is a modern, high-performance omnichannel customer support and engagement hub powered by **Google Gemini AI**. It seamlessly connects customer conversations from **Discord, Telegram, WhatsApp, Webchat, Instagram, and LinkedIn** into a unified real-time dashboard.

---

## 🚀 Key Features

* **Unified Omnichannel Inbox:** Two-way real-time conversation routing across Discord, Telegram, WhatsApp, and Webchat.
* **Auto-Pilot Bot (Google Gemini):** Automated AI customer responses in natural language (Hindi, Hinglish, English) with brand FAQs and tone awareness.
* **Smart Approvals Queue:** Hold AI drafts for human review (`MANUAL` mode) or dispatch immediately (`AUTO` mode).
* **AI Copilot & Insights:** 3 contextual smart reply suggestions, automated sentiment & intent detection, and 1-click conversation summarization.
* **Live WebSockets:** Real-time bi-directional events via Socket.io with instant notifications and chimes.
* **Security & Session Management:** JWT authentication with 40-hour session tokens, email OTP verification, and multi-device session revocation.
* **Real Analytics:** Aggregated channel breakdown, active conversations, and response times.

---

## 🛠️ Tech Stack

### Backend
* **Runtime:** Node.js (ESM) + Express
* **Database:** MongoDB Atlas (Mongoose) + Upstash Redis Cloud
* **AI:** Google Gemini API (`@google/genai`)
* **Real-time:** Socket.io
* **Monitoring:** Sentry (`@sentry/node`)
* **Integrations:** Discord.js, Telegram Bot API, Meta WhatsApp Cloud API, Nodemailer (Gmail SMTP)

### Frontend
* **Framework:** React 19 + Vite
* **State Management:** Redux Toolkit
* **Real-time:** Socket.io Client
* **Styling & Icons:** Lucide React, Custom CSS Design System

---

## 📂 Project Structure

```text
Omni Hub/
├── omnihub-backend/          # Node.js Express API Server & Webhooks
│   ├── src/
│   │   ├── config/           # DB, Redis, Env configurations
│   │   ├── controllers/      # Route controllers (Auth, Conversations, AI, etc.)
│   │   ├── middleware/       # JWT Protect, Rate Limiting, Validation
│   │   ├── models/           # Mongoose Models (User, Conversation, Message, etc.)
│   │   ├── routes/           # REST & Webhook endpoints
│   │   ├── services/         # AutoPilot, AI, Email, Dispatcher, Telegram, Discord
│   │   ├── sockets/          # Socket.io handlers (Auth, Conversations, Analytics)
│   │   └── server.js         # Entry point
│   ├── postman/              # Postman collection & environment files
│   └── .env.example          # Template for backend environment variables
├── omnihub-frontend/         # Vite React Dashboard
│   ├── src/
│   │   ├── components/       # CenterPanel, AutoPilotToggle, ChatBubble, etc.
│   │   ├── context/          # SocketContext (real-time transport)
│   │   ├── pages/            # Dashboard, Approvals, Analytics, Auth pages
│   │   ├── services/         # API & Auth services
│   │   └── store/            # Redux slices
│   └── .env                  # Frontend configuration
├── .gitignore                # Root gitignore (never commits secrets)
└── README.md
```

---

## ⚙️ Getting Started

### 1. Backend Setup
```bash
cd omnihub-backend
npm install
cp .env.example .env     # Fill in your MongoDB, Redis, JWT, and API keys
node src/server.js
```

### 2. Frontend Setup
```bash
cd omnihub-frontend
npm install
npm run dev
```

Visit dashboard at `http://localhost:5173`.


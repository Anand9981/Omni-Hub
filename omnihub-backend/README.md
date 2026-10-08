# OmniHub Backend Engine 🚀

OmniHub is an enterprise-grade multiplatform messaging automation backend built with Node.js, Express, MongoDB, Socket.io, and Google Gemini AI.

## 🌟 Key Features
- **Multiplatform Inbound Webhooks**: Telegram, Discord, WhatsApp, Instagram, LinkedIn, and Website Webchat.
- **Universal Normalizer**: Standardizes inbound messages across all 6 messaging channels into a unified format.
- **Gemini AI Integration**: Autonomous response generation, language detection (Devanagari Hindi, Hinglish, English), draft polishing, and forbidden topic guardrails.
- **Human-in-the-Loop Approvals**: Auto-pilot toggle with manual approval queue for high-value customer interactions.
- **Interactive Menu Engine**: Sub-menu expansions, digital brochure PDF delivery, and catalog browsing.
- **Real-time Event Streaming**: Socket.io manager broadcasting new messages, delivery status, typing indicators, and live analytics snapshots.
- **Background Cron Engine**: Hourly analytics aggregation, daily reports, automatic failed message retry, and database cleanup.
- **Full Operational Dashboard Suite**: Support agent management, lead extraction, canned responses, WhatsApp templates, business hours, and subscription billing.

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js >= 18.0.0
- MongoDB 7.0 (Local or Cloud Atlas)
- Redis (Optional; falls back to in-memory mode)

### 1. Installation
```bash
git clone <repository_url>
cd omnihub-backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 3. Seed Database
Initialize default Admin, Agent, Pricing Plans, Business Hours, and AI Context:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

Server will run at: `http://localhost:5000`

---

## 🐳 Docker Deployment
Run using Docker Compose:
```bash
docker-compose up -d --build
```

---

## 📁 Directory Structure
Detailed file hierarchy is documented in [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md).

---

## 📑 Documentation Links
- [API Reference](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

---

## 📄 License
ISC License © 2026 OmniHub Team

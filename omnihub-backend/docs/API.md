# OmniHub API Reference Documentation

Welcome to the OmniHub Backend API reference. OmniHub provides a unified RESTful and Socket.io API for multiplatform messaging (WhatsApp, Telegram, Discord, Instagram, LinkedIn, Webchat), Gemini AI automation, human agent collaboration, and operational analytics.

## Base URL
- Local Development: `http://localhost:5000/api`
- Socket.io Endpoint: `ws://localhost:5000`

---

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in and receive JWT token | No |
| POST | `/api/auth/refresh` | Refresh JWT access token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/logout` | Invalidate current session | Yes |

---

## Operational Endpoints (`/api/dashboard` or `/api/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/conversations` | List conversation threads | Yes |
| GET | `/api/messages/:conversationId` | Fetch message history | Yes |
| POST | `/api/messages/send` | Send outbound message | Yes |
| GET | `/api/approvals` | List pending AI response drafts | Yes |
| POST | `/api/approvals/:id/approve` | Approve AI draft for delivery | Yes |
| GET | `/api/leads` | List extracted sales leads | Yes |
| GET | `/api/agents` | List support team agents | Yes |
| GET | `/api/ai-context` | Get AI system prompt & FAQ rules | Yes |
| GET | `/api/canned-responses` | List quick reply snippets | Yes |
| GET | `/api/templates` | List message templates | Yes |
| GET | `/api/business-hours` | Get schedule & holiday mode | Yes |
| GET | `/api/channels` | Multiplatform channel status | Yes |
| GET | `/api/billing/plans` | List available subscription tiers | Yes |
| GET | `/api/widget` | Get webchat widget config | No |
| GET | `/api/onboarding` | Get wizard checklist progress | Yes |

---

## Inbound Webhooks (`/api/webhooks`)

- Telegram: `POST /api/webhooks/telegram`
- Discord: `POST /api/webhooks/discord`
- WhatsApp: `GET/POST /api/webhooks/whatsapp`
- Instagram: `GET/POST /api/webhooks/instagram`
- LinkedIn: `POST /api/webhooks/linkedin`
- Webchat: `POST /api/webhooks/website`

# OmniHub Backend — API Reference Document 📚

Welcome to the OmniHub Backend API Reference. All API responses conform to a standardized JSON schema:

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "meta": { "pagination": { "total": 100, "page": 1, "limit": 20 } },
  "timestamp": "2026-10-10T00:00:00.000Z"
}
```

---

## 1. System & Health Endpoints

### Health Check
- **Endpoint**: `GET /health` or `GET /api/health`
- **Auth**: None (Public)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "service": "omnihub-backend",
      "database": "CONNECTED",
      "uptime": 124.5,
      "memory": { "rss": "84MB", "heapUsed": "42MB" }
    }
  }
  ```

---

## 2. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate with email & password | Public |
| `POST` | `/api/auth/verify-2fa` | Verify 6-digit OTP for 2FA login | Public |
| `POST` | `/api/auth/resend-otp` | Request a fresh OTP | Public |
| `POST` | `/api/auth/refresh` | Rotate access token via refresh token | Public |
| `GET` | `/api/auth/me` | Get currently logged-in user profile | Bearer |
| `POST` | `/api/auth/2fa/toggle` | Enable/disable 2FA | Bearer |
| `POST` | `/api/auth/2fa/backup-codes/regenerate` | Generate 10 new emergency backup codes | Bearer |
| `GET` | `/api/auth/sessions` | List active device sessions | Bearer |
| `DELETE` | `/api/auth/sessions/:sessionId` | Revoke a specific session | Bearer |

---

## 3. Webhooks Ingestion (`/api/webhooks`)

| Method | Endpoint | Description | Verification |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/webhooks/whatsapp` | Meta Webhook subscription handshake | `hub.challenge` verification |
| `POST` | `/api/webhooks/whatsapp` | Inbound WhatsApp Cloud API messages | Meta HMAC Signature |
| `POST` | `/api/webhooks/telegram` | Inbound Telegram Bot messages & button clicks | Telegram Bot Secret Header |
| `POST` | `/api/webhooks/discord` | Inbound Discord Gateway / interaction events | Discord Bot Token |
| `GET` | `/api/webhooks/instagram` | Instagram Graph API subscription handshake | Meta verify token |
| `POST` | `/api/webhooks/instagram` | Inbound Instagram DMs & story mentions | Meta HMAC Signature |
| `POST` | `/api/webhooks/linkedin` | Inbound LinkedIn messaging events | OAuth Header |
| `POST` | `/api/webhooks/website` | Inbound Website Live Chat Widget messages | Widget API Key |

---

## 4. Conversations & Messages (`/api/conversations`, `/api/messages`)

### List Conversations
- **Endpoint**: `GET /api/conversations` (or `/api/dashboard/conversations`)
- **Auth**: Bearer
- **Query Params**:
  - `page` (number, default: 1)
  - `limit` (number, default: 50)
  - `platform` (telegram | whatsapp | discord | instagram | webchat)
  - `query` (search name, phone, or email)
  - `status` (ACTIVE | CLOSED | ARCHIVED)
  - `onlyUnread` (boolean)
  - `onlyHuman` (boolean)
  - `assignedToMe` (boolean)

### Send Outbound Message
- **Endpoint**: `POST /api/messages/:conversationId`
- **Auth**: Bearer
- **Body**:
  ```json
  {
    "text_content": "Hello! How can we help you?",
    "media_url": "https://example.com/brochure.pdf",
    "media_type": "application/pdf",
    "buttons": [{ "id": "btn_pricing", "label": "View Pricing", "action": "input" }]
  }
  ```

---

## 5. Approvals Queue (`/api/approvals`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/approvals` | List all drafts pending human review |
| `POST` | `/api/approvals/:id/approve` | Approve AI draft and dispatch to customer |
| `POST` | `/api/approvals/:id/edit` | Edit proposed text and dispatch |
| `POST` | `/api/approvals/:id/reject` | Reject and drop draft response |

---

## 6. Real-Time CRM & Leads (`/api/leads`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | List all extracted leads (supports `page`, `limit`, `status`, `tag`) |
| `GET` | `/api/leads/:conversationId` | Get lead profile for a conversation |
| `PUT` | `/api/leads/:conversationId` | Update contact details, tags, or notes |

---

## 7. AI & Prompt Engine (`/api/ai`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/generate` | Generate AI reply for custom prompt |
| `POST` | `/api/ai/polish` | Polish rough draft text into professional message |
| `GET` | `/api/ai-context` | Get company knowledge base and tone settings |
| `PUT` | `/api/ai-context` | Update instructions, FAQs, and forbidden topics |

---

## 8. Analytics & Reporting (`/api/analytics`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics` | Fetch multi-channel daily volume & breakdown |
| `GET` | `/api/analytics/hourly` | Fetch 24-hour peak volume line chart data |
| `GET` | `/api/analytics/kpis` | Summary scorecards (resolution rate, latency, active chats) |
| `GET` | `/api/analytics/export` | Download CSV / JSON analytics report |

---

## 9. Settings & Config

- **Channels**: `/api/channels` (GET, POST, DELETE)
- **Business Hours**: `/api/business-hours` (GET, PUT, toggle holiday mode)
- **Canned Responses**: `/api/canned-responses` (GET, POST, PUT, DELETE)
- **WhatsApp Templates**: `/api/templates` (GET, POST, PUT, DELETE)
- **Widget Customizer**: `/api/widget/config` (GET, PUT)
- **Subscription & Billing**: `/api/subscription`, `/api/billing/invoices`


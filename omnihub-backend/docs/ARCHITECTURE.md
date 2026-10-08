# OmniHub Backend Architecture Specification

## Overview
OmniHub Backend is built with Node.js ES Modules, Express, Mongoose, and Socket.io.

```
                  ┌───────────────────────┐
                  │ Multiplatform Inbound │
                  │  Webhooks & Frontend  │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │     Express App       │
                  │ (Middlewares & Auth)  │
                  └───────────┬───────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
   ┌────────────────┐ ┌───────────────┐ ┌───────────────┐
   │ Normalizer &   │ │ Gemini AI &   │ │ Socket Manager│
   │ Ingestion      │ │ Context Guard │ │ Real-time Hub │
   └───────┬────────┘ └───────┬───────┘ └───────┬───────┘
           │                  │                 │
           └──────────────────┼─────────────────┘
                              ▼
                  ┌───────────────────────┐
                  │   MongoDB Storage &   │
                  │   Background Crons    │
                  └───────────────────────┘
```

## Key Architectural Principles
1. **Strict Directory Organization**: No logic bleeding outside designated controllers/services/models.
2. **Universal Normalizer**: All incoming payloads (Telegram, WhatsApp, etc.) are converted into a standard `{ platform, external_chat_id, sender_name, text_content }` contract before processing.
3. **Dual Dispatch System**: Outbound messages pass through Human-in-the-Loop approval checks if manual mode is enabled.
4. **Real-time Event Bus**: Single point of emission via `sockets/index.js`.

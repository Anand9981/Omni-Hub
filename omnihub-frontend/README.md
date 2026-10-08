# OmniHub frontend

Full-screen, desktop-first React and Vite website for the OmniHub authentication and account-security flows.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build`.

## Visual direction

Keep new frontend modules aligned with the shared OmniHub visual system in `src/styles.css`: a clean enterprise layout, deep navy surfaces, confident blue actions, warm amber highlights, soft cool-gray page backgrounds, restrained shadows, and rounded white cards. Reuse the existing buttons, panels, form controls, spacing, and typography patterns rather than introducing a separate module palette.

## Frontend-only authentication demo

Module 5 uses browser-local demo state; no backend, JWT, email delivery, or real OTP delivery is required to run the frontend.

- Register an account, use **I’ve verified my email** on the demo verification screen, then sign in with the same email and password.
- Enter OTP `123456`; the OTP expires after five minutes. Resending is rate-limited by the thirty-second cooldown and three-resend limit. Five invalid codes trigger a fifteen-minute demo lockout.
- Backup codes are generated after the first successful OTP login. They can be used once as an alternative sign-in code and regenerated under Account security.
- Password reset requests create a local demo reset flow that expires after fifteen minutes. Session history and sign-in audit details are also stored only in this browser.
- Email verification, email delivery, JWT/refresh-token issuance, IP/location logging, new-device alerts, and server-enforced role permissions require a backend and are intentionally not simulated as production security.
- This demo stores credentials and session state in browser storage and must not be used with real credentials or as production authentication.

## Module 7 interactive menus demo

- Open **Menu studio** from an admin conversation to create nested button menus (up to three levels), automated replies, custom-input prompts, human handoff previews, and media actions. Save a menu locally or send it to the active thread as a test message; selecting its buttons simulates the customer response in that conversation.
- Platform limits follow the PRD: WhatsApp 3 buttons per menu, Instagram 13, Discord 5 per row, and Telegram/Website unlimited. Back and Main menu navigation are available in nested chat menus.
- Upload PDFs or images up to 1 MB, or add a secure HTTPS fallback link. Outgoing messages containing brochure, catalog, QR code, or pricing keywords attach the matching local asset/fallback when configured. Menu settings and uploads stay in this browser; no live channel messages or remote media hosting are involved.

## Module 8 multilingual AI demo

- Choose Match customer, English, Hindi, or Hinglish beside **Polish with AI**. Auto mode detects Devanagari Hindi and common Hinglish cues; the local demo refines tone without sending drafts to a provider. Selecting a different language than the draft needs a connected AI provider and is reported rather than pretending to translate.
- Admins can manage approved business facts, services, working hours, pricing, resource URLs, and response tone under **AI context**. Unknown facts and unconfigured prices fall back to a team follow-up; generated replies are capped at three sentences.
- AI context is browser-local. The language/refinement and reply generator are deterministic demo helpers—not Gemini, a live AI integration, or production-grade language detection.

## Module 11 website chat widget demo

- Configure colors, position, size, language, welcome/offline messages, optional HTTPS avatar, manual offline mode, and sound under **Website widget**. The embed carries the workspace business-hours/holiday snapshot and shows the offline form outside scheduled hours. The live preview supports the pre-chat form, local messages, typing indicator, and PDF/image attachments up to 1 MB.
- Copy the generated snippet into your site. `public/widget.js` loads an isolated cross-origin `/widget` iframe and sends only the public widget configuration to that frame using origin-checked `postMessage`; no OmniHub dashboard bundle or credentials are exposed to the host page.
- Opens, messages, contact conversions, and average session time are browser-local demo metrics. A real website visitor cannot share metrics or chats back to the workspace across devices without an authenticated backend/API; live agent presence and message routing are not simulated as production features.

## Module 9 dashboard demo

- The inbox, conversation history, lead details, notes, and approval drafts use seeded browser-local demo data.
- Use **Simulate inbound** on an open thread to exercise the three per-thread modes: Auto-Pilot ON with auto-send creates a local AI reply; Auto-Pilot ON with manual approval creates a held draft; Auto-Pilot OFF leaves the response to a human.
- Approve, edit, or reject held drafts in the conversation or Approval queue. Resolving one draft does not change that conversation’s approval mode.
- Messages and approvals are not delivered to real channels. The socket indicator shows the local demo event bus unless a compatible backend is configured.

## Module 12 analytics demo

- Analytics are derived from browser-local conversations, messages, leads, and approval drafts. The overview refreshes every five seconds and provides today, yesterday, 7-day, 30-day, and custom date filters.
- Channel volume, inbound channel share, hourly traffic, response mix, KPI cards, and per-platform counters are available on `/analytics`. Daily, weekly, and monthly report presets are on `/reports`.
- CSV export downloads a summary and per-channel breakdown. PDF export opens the browser print dialog; choose **Save as PDF** there.
- The response-latency value is a labelled demo estimate. Live server analytics, channel traffic, scheduled email reports, and real Socket.IO counter events need a backend and are not simulated as production data.

## Module 13 agent operations demo

- Admins can browse agent availability, expertise, workload and performance on `/agents`, then update an agent's status and concurrent-chat limit on their profile.
- Assign or unassign conversations from the inbox. The assignment dialog supports direct assignment plus round-robin, load-balanced, skill-matched, and territory-matched routing; online agents are capped at their configured capacity. Use the inbox's **Unassigned queue** filter to review waiting conversations.
- Agent profiles show assigned conversations, first-response time and human messages derived from local conversation history. Satisfaction and average resolution time are labelled demo profile metrics.
- Agent accounts are scoped to conversations assigned to the matching local agent profile; Admin/Super Admin accounts can view the workspace directory and assign across the workspace.
- Agent profiles, status and conversation assignments are saved in this browser's local demo storage. There is no live team directory, server-enforced role policy, automatic production routing, or real agent presence without a backend.

## Module 10 lead management demo

- The `/leads` directory includes customer profiles, status pipeline filters, priority filtering, channel context, tag editing, activity/name sorting and a user-triggered CSV export.
- Incoming demo messages are scanned locally for email addresses, phone numbers, and introductions such as “My name is…”; captured details are added to that conversation's lead without overwriting existing CRM values. Pricing, setup/support, and urgent-buying intent add the corresponding suggestion tags.
- Lead status and tags are shared with the conversation's dashboard sidebar and are saved in browser localStorage. Agent accounts see leads from their assigned conversations; viewers can inspect records without editing them.
- CSV export is a browser download. Third-party CRM integration, server-side extraction, shared cross-device updates, and production data retention remain future/backend scope.

## Module 14 canned responses demo

- The `/canned-responses` library lets the team create, edit, search, filter, favorite, and delete reusable replies across Pricing, Support, Sales, and FAQ categories in English, Hindi, and Hinglish.
- Use `{customer_name}` and `{business_name}` in a reply to personalize it when inserted. From a conversation, type `/` and continue a shortcut or phrase to search; use the Quick reply button for recent replies and favorites. Arrow keys and Enter choose a result, Escape closes the menu, and Ctrl+1…9 inserts a favorite.
- Usage counts, favorites, and response content are stored in this browser's localStorage. Sending replies, shared team libraries, and cross-device usage synchronization require a backend and are not simulated as production data.

## Module 15 message search and filters demo

- Search matches customer name, email, phone, and text across the full local conversation history. Quick inbox views cover All, Unread, Pending approval, and Human takeover.
- Advanced filters include channel, message status, lead tag, activity date range, assignment, media, lead presence, and detected English/Hindi/Hinglish language. Inbox sorting supports latest, oldest, most messages, longest pending, and priority.
- Save filtered views in the browser sidebar and use the copy-link action to share a URL that restores those filters when opened on the dashboard. Saved searches and conversation data are browser-local demo state; team-wide shared storage and production message indexing require a backend.

## Module 16 conversation notes demo

- The dashboard lead panel includes a private, chronological notes timeline with General note, Follow-up, Issue, Resolution, and Escalation types.
- Type `@` to find a team member; mentions create browser-local notification records visible when that agent views the same conversation. Notes can also be assigned to an agent.
- Attach up to three files (1 MB each); attachments are stored with the note in this browser and can be downloaded from the timeline. Note text, assignments, mentions, attachments, and deletion are browser-local only; cross-device collaboration and real-time notifications require a backend.

## Module 17 business hours demo

- Configure each weekday, split shifts, workspace time zone, holiday dates, and special sale/event hours at `/business-hours`.
- Set outside-hours replies in English, Hindi, and Hinglish, with an expected response time and optional emergency contact. Holiday mode supports a custom reply, date window, and automatic resume.
- Settings persist in this browser only. Scheduled message delivery, queueing, and automatic resume at runtime require a backend and are not simulated.

## Module 18 WhatsApp templates demo

- Manage WhatsApp template drafts by category (Marketing, Utility, Authentication, Service) and language. Search/filter the library, preview sample variable expansion in a WhatsApp-style conversation, and inspect template version history.
- Supported placeholders are `{{customer_name}}`, `{{order_id}}`, `{{amount}}`, `{{date}}`, and `{{business_name}}`. Each template name must be unique per language; editing a submitted/approved template creates a new draft version.
- In a WhatsApp conversation, use **WA template** in the composer to select an approved template, fill its variables, and insert the completed message into the reply draft.
- “Simulate submission” changes the browser-local status to Pending only; it does not submit to Meta or fabricate approval/rejection decisions. Live WhatsApp Business API submission, review status updates, and sending require backend credentials and integration.

## Module 19 message status demo

- Outbound dashboard bubbles distinguish Sent, Delivered, Read (WhatsApp read receipts use blue ticks), Pending approval, Rejected, and Failed. Incoming read status is not shown as an outbound receipt.
- Failed messages show the recorded channel error, delivery attempt count (up to three total local demo attempts), and email/SMS fallback links when customer contact details exist. A retry changes the local status to Sent/queued; no real channel resend or fallback message is made.
- Delivery receipt updates can be applied through the message slice and persist in this browser. Real platform webhooks, socket broadcasts, server retry scheduling, analytics updates, and confirmed fallback delivery require a backend.

## Module 30 first-time workspace onboarding demo

- Admins can resume the eight-step setup journey at `/onboarding`: account and email verification, business profile, channels, AI knowledge, interactive menu, team invite list, and go-live checks. A dismissible setup reminder appears on the dashboard until onboarding is completed; the sidebar link remains available.
- Knowledge supports English, Hindi, and Hinglish, browser-local FAQs and secure website URLs, plus PDF/DOCX files up to 2 MB. File bytes and checklist state stay in this browser; file indexing, website crawling, email invitations, OAuth, and real channel activation need backend services.
- Channel credentials are never persisted. Telegram/Discord checks and Meta connection intent are demo-only; LinkedIn and real integrations remain future scope. Completing onboarding only marks the local checklist complete and does not change channel or account access.

## Module 31 channel-wise API setup guide

- Admins can open `/channels` for PRD-aligned setup instructions for Telegram, Discord, Website Chat, WhatsApp, Instagram, LinkedIn, and Gemini AI. Search filters the guide by platform, setup terms, and webhook endpoint.
- The guide lists where to obtain credentials, platform-specific setup steps, relative webhook references, and applicable trial/free-tier notes. Relative webhook paths need a deployed backend origin; they are references, not live receivers. Gemini quota figures are labelled as PRD references and must be checked against current Google AI Studio terms.
- No secrets are requested or stored, and reading the guide does not connect any external platform or send messages. Configure production credentials in server-side secret storage; the Website and AI context links open their existing frontend demo settings.

## Module 32 future billing structure

- Admins can review Basic (1 channel/1,000 messages), Standard (3 channels/10,000 messages), Premium (all channels/unlimited), and Custom plan structures at `/billing`; monthly, quarterly (10% discount), and yearly (20% discount) cycles and Razorpay, Stripe, Fonepay, and UPI gateway preferences are represented.
- Plan, billing-cycle, gateway, and auto-renew preferences are saved locally only. Prices are intentionally unspecified, and selecting/saving a preference never starts a subscription or charge.
- `/subscription` shows trial/no-subscription status, local-history usage context, empty invoice/payment-history placeholders, and the planned seven-day grace-period-before-suspension policy. Checkout, payment processing, invoices, recurring billing, usage metering, grace-period enforcement and cross-device billing require the future billing backend and are not simulated.

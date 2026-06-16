# 010 — Email Module

## User Stories

**US-1**: As a sales rep, I can send an email to a contact directly from the contact detail page, and it's tracked in the email thread.

**Acceptance**: EmailComposer on contact detail allows entering subject (if new thread) and body. Submitting calls `sendEmail`, which sends via Resend and stores the message in `email_messages`.

**US-2**: As a support agent, I can send a reply email from a ticket detail page, and it's linked to the ticket's email thread.

**Acceptance**: EmailComposer on ticket detail pre-fills the ticket subject. Sent reply appears in the ticket thread view.

**US-3**: As a sales rep, I can view the full email thread history on a contact or ticket detail page.

**Acceptance**: `EmailThreadView` component renders all email messages sorted by sent_at. Inbound emails show sender address; outbound shows "You".

**US-4**: As a system admin, inbound emails forwarded to the webhook are matched to existing threads or contacts and stored automatically.

**Acceptance**: POST `/api/webhooks/email` with provider payload is parsed, matched by provider_message_id or contact email, and stored as an `email_message` linked to the correct thread and ticket (if applicable).

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | sendEmail: find or create email_thread for contact_id or ticket_id |
| FR-02 | sendEmail: send via Resend API using org's from address |
| FR-03 | sendEmail: store in email_messages as direction='outbound' |
| FR-04 | sendEmail: enforce free plan limit (500 outbound/month) |
| FR-05 | handleInboundEmail: webhook at POST /api/webhooks/email (no auth — use signature verification) |
| FR-06 | handleInboundEmail: match by provider_message_id (dedup) or create new message |
| FR-07 | handleInboundEmail: link to email_thread by matching contact email or subject |
| FR-08 | getEmailThreads(contactId?): list threads, optionally filtered by contact |
| FR-09 | getEmailThread(threadId): return thread + all messages sorted by sent_at |
| FR-10 | EmailComposer component: to address pre-filled from contact, subject, body textarea, send button |
| FR-11 | EmailThreadView component: renders messages with direction styling |
| FR-12 | Both EmailComposer and EmailThreadView placed in `src/components/shared/` |
| FR-13 | Email thread visible in contact detail AND ticket detail (shared component) |
| FR-14 | No attachment support in v1 |

---

## Key Entities

- `email_threads` — one thread per contact-or-ticket conversation
- `email_messages` — individual messages within a thread
- `contacts` — linked to threads
- `tickets` — linked to threads

---

## Success Criteria

1. Sending email from contact detail creates a message in email_messages and increments monthly email count.
2. Inbound webhook is idempotent on duplicate provider_message_id.
3. EmailThreadView renders inbound and outbound messages with correct direction styling.
4. Free plan limit (500/month) blocks sending with a clear error.
5. Thread appears on both contact detail and ticket detail when linked to both.

---

## Assumptions

- Resend is the email provider (install `resend` npm package).
- Webhook signature verification uses Resend's `svix` library or a shared secret header check.
- From address is a fixed org-level address (e.g., `org@freshcrm.io`) — no per-user from address in v1.
- Thread subject = email subject (first message in thread sets it).
- No email templates or HTML editor in v1 — plain text body only.
- Monthly email count tracked by counting email_messages WHERE direction='outbound' AND sent_at >= start of month.

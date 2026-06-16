# Implementation Plan: Email

**Feature**: 010-email
**Date**: 2026-06-16
**Depends on**: 008-tickets (EmailThreadView shown in ticket detail), 005-contacts (EmailThreadView shown in contact detail)
**Blocks**: 011-reports (email count used in billing)

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strict | PASS | All types from crm.ts; no `any` |
| II. YAGNI | PASS | No attachments, no scheduling, no templates in v1 |
| III. Provider Architecture | PASS | Resend only imported in `src/lib/actions/email.ts` and webhook route |
| IV. Multi-Tenancy | PASS | All email_threads and email_messages scoped to org_id via queryForOrg |
| V. Zod at Every Boundary | PASS | sendEmailSchema, inboundEmailSchema validated before any action |
| VI. Auth Guard First | PASS | `getAuthUser()` first in all actions; webhook uses signature check instead |
| VII. Test Gates | PASS | Unit tests on sendEmail (limit check, thread find/create); E2E for send flow |
| VIII. Stitch-First UI | PASS | No dedicated Stitch screen; EmailComposer/ThreadView match contact detail + ticket detail screens |

All 8 principles: **PASS**

---

## Source Code Structure

```
src/
  app/
    api/
      webhooks/
        email/
          route.ts          # POST handler for inbound email
  components/
    shared/
      EmailComposer.tsx     # compose + send form (Client Component)
      EmailThreadView.tsx   # read-only thread display (Client Component)
  lib/
    actions/
      email.ts              # sendEmail, getEmailThreads, getEmailThread, handleInboundEmail
    validations/
      email.ts              # sendEmailSchema, inboundEmailSchema
```

No new pages — email is embedded in contact detail and ticket detail via shared components.

---

## Phase 0: Dependencies

Install Resend SDK: `pnpm add resend`  
Env vars required: `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`

---

## Phase 1: DB Migration

New tables: `email_threads`, `email_messages`

```sql
CREATE TABLE email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
  from_addr TEXT NOT NULL,
  to_addrs TEXT[] NOT NULL DEFAULT '{}',
  body_html TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

RLS: `email_threads.org_id = current_org_id()` (SELECT/INSERT/UPDATE/DELETE). `email_messages` via join to `email_threads`.

---

## Phase 2: Server Actions

`src/lib/actions/email.ts`:
- `sendEmail(data)` — find/create thread, call `resend.emails.send()`, insert `email_messages` row, enforce 500/month limit
- `getEmailThreads(contactId?)` — list threads with latest preview + count
- `getEmailThread(threadId)` — return thread + messages ordered by sent_at
- `handleInboundEmail(data)` — called by webhook route; match by provider_message_id → skip dup; match contact by from_addr; create/find thread; insert message

---

## Phase 3: Webhook Route

`src/app/api/webhooks/email/route.ts`:
- Verify `Resend-Signature` header against `RESEND_WEBHOOK_SECRET`
- Parse payload → call `handleInboundEmail()`
- Return 200 immediately (Resend retries on non-2xx)

---

## Phase 4: Shared Components

`EmailComposer.tsx` (Client):
- `to` (pre-filled, read-only), `subject` (editable if new thread), `body` (textarea)
- Submit → call `sendEmail()` Server Action
- Show success toast / error inline

`EmailThreadView.tsx` (Client):
- Receives `messages: EmailMessage[]`
- Each message: direction badge (inbound=gray, outbound=indigo), from address, body_html (sanitised), sent_at formatted
- Uses `formatDateTime` from utils

---

## Phase 5: Tests

Unit: `sendEmail` (monthly limit check, thread reuse, new thread creation)  
Unit: `handleInboundEmail` (dedup by provider_message_id, contact match)  
E2E: Send email from contact detail → appears in thread view  
E2E: Simulated inbound webhook → message appears in thread

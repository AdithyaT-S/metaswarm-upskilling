# Tasks: Email

**Feature**: 010-email
**Date**: 2026-06-16
**Depends on**: 005-contacts, 008-tickets

---

## Phase 0: Setup

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-0.1 | Install `resend` package: `pnpm add resend` | No | — |
| T-0.2 | Add env vars to `.env.example`: `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET` | Yes (with T-0.1) | — |
| T-0.3 | Write `db/migrations/005_email.sql` — `email_threads` + `email_messages` tables with RLS | No | — |

---

## Phase 1: Validation + Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-1.1 | Write `src/lib/validations/email.ts` — `sendEmailSchema` (to, subject, body, contact_id?, ticket_id?), `inboundEmailSchema` | No | T-0.3 |
| T-1.2 | Write `src/lib/actions/email.ts` — `sendEmail`, `getEmailThreads`, `getEmailThread`, `handleInboundEmail` | No | T-1.1 |

---

## Phase 2: Webhook Route

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-2.1 | Write `src/app/api/webhooks/email/route.ts` — verify Resend signature, call `handleInboundEmail`, return 200 | No | T-1.2 |

---

## Phase 3: Shared Components

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-3.1 | Write `src/components/shared/EmailComposer.tsx` — compose form, calls `sendEmail`, toast feedback | No | T-1.2 |
| T-3.2 | Write `src/components/shared/EmailThreadView.tsx` — message list, direction styling, sanitised HTML | Yes (with T-3.1) | — |
| T-3.3 | Export both from `src/components/shared/index.ts` | No | T-3.1, T-3.2 |

---

## Phase 4: Integration

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-4.1 | Add `EmailComposer` + `EmailThreadView` to contact detail (`/contacts/[id]/page.tsx`) | No | T-3.3 |
| T-4.2 | Add `EmailComposer` + `EmailThreadView` to ticket detail (`/tickets/[id]/page.tsx`) | Yes (with T-4.1) | T-3.3 |

---

## Phase 5: Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-5.1 | Unit: `sendEmail` — monthly limit enforcement, thread reuse vs new thread, Resend API call mocked | No | T-1.2 |
| T-5.2 | Unit: `handleInboundEmail` — dedup by provider_message_id, contact match by email | Yes (with T-5.1) | T-1.2 |
| T-5.3 | E2E: send from contact detail → message appears in thread view | No | T-4.1 |

---

## Swarm Agent Assignment

| Agent | Tasks |
|---|---|
| architect | T-0.3 (schema), T-2.1 (webhook signature pattern) |
| coder | T-0.1–T-0.2, T-1.1–T-1.2, T-3.1–T-3.3, T-4.1–T-4.2 |
| test-automator | T-5.1–T-5.3 |
| code-review | Verify Resend import only in actions/email.ts + webhook route; signature check present |

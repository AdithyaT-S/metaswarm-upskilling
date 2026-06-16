# Research — 010 Email

## Decision Log

### D-1: Email Provider — Resend

**Decision**: Use Resend (`npm install resend`) as the outbound email provider.

**Rationale**: Simple API, generous free tier, excellent Next.js compatibility. `resend.emails.send()` takes `{ from, to, subject, text/html }` and returns an id.

**Alternatives**: SendGrid, Postmark — more complex setup; overkill for v1.

---

### D-2: Webhook Authentication

**Decision**: Use a shared secret header check for the inbound webhook. The webhook endpoint reads `X-Webhook-Secret` and compares to `process.env.EMAIL_WEBHOOK_SECRET`. Reject if missing or mismatched.

**Rationale**: Simple, zero-dependency approach. The webhook is a Next.js Route Handler (not a Server Action), so `getAuthUser()` is not applicable.

**Alternatives**: Resend's svix signature verification — more robust but requires installing the `svix` package and Resend-specific signing. Can be upgraded later.

---

### D-3: Thread Find-or-Create Logic

**Decision**: `sendEmail` looks for an existing `email_thread` WHERE (contact_id = $contact_id OR ticket_id = $ticket_id) AND subject = $subject. If found, adds to that thread. If not, creates a new thread.

**Rationale**: Keeps email conversations grouped by subject and entity. Simple string match on subject is good enough for v1.

**Alternatives**: Match only by entity (contact or ticket) — would merge all emails to a contact into one thread regardless of subject. Too aggressive.

---

### D-4: Inbound Email Deduplication

**Decision**: `handleInboundEmail` checks for existing `email_message WHERE provider_message_id = $id`. If found, skip (return 200 with no-op). If not, insert.

**Rationale**: Email providers may send webhooks multiple times for the same message. Deduplication via provider_message_id ensures idempotency.

**Alternatives**: Upsert (INSERT ... ON CONFLICT DO NOTHING) — cleaner; use this pattern.

---

### D-5: Shared Component Placement

**Decision**: `EmailComposer` and `EmailThreadView` placed in `src/components/shared/` (not in any module's `_components/`).

**Rationale**: Both components are consumed by contact detail (module 005) and ticket detail (module 008). Shared placement avoids duplication.

**Alternatives**: Place in one module and import from the other — creates undesirable cross-module imports.

---

### D-6: Monthly Email Count

**Decision**: Count outbound emails monthly via: `SELECT COUNT(*) FROM email_messages WHERE org_id = $org AND direction = 'outbound' AND sent_at >= date_trunc('month', now())`.

**Rationale**: Simplest approach. No additional counter table needed. Count query runs before each send.

**Alternatives**: Increment a counter in an org_usage table — more efficient at scale but premature optimization for v1.

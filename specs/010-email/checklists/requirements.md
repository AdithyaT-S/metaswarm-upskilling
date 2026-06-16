# Requirements Checklist — 010 Email

## Quality Gates

- [x] sendEmail action: getAuthUser() first; Zod validation; queryForOrg for all DB ops
- [x] No DB imports outside `src/lib/db/`
- [x] No TypeScript `any` except raw DB boundaries
- [x] RLS on email_threads and email_messages tables
- [x] Free plan limit (500/month) checked before calling Resend API
- [x] handleInboundEmail: idempotent on provider_message_id (upsert or skip)
- [x] Webhook endpoint at /api/webhooks/email (POST) — no auth via getAuthUser(); use header secret
- [x] EmailComposer in src/components/shared/ — reusable on contact + ticket detail
- [x] EmailThreadView in src/components/shared/ — reusable on contact + ticket detail
- [x] Thread sorted by sent_at ASC (chronological)
- [x] Resend package installed; API key from env var RESEND_API_KEY
- [x] Vitest unit tests for sendEmail action + handleInboundEmail
- [x] Playwright E2E for send flow (mock Resend in test env)

## Scope Boundaries

- Email templates/HTML editor: out of scope for v1.
- Attachments: out of scope for v1.
- Per-user from addresses: out of scope for v1.
- Email scheduling: out of scope for v1.
- Read receipts/open tracking: out of scope for v1.

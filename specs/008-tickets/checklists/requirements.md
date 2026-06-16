# Requirements Checklist — 008 Tickets

## Quality Gates

- [x] Every Server Action calls `getAuthUser()` first
- [x] All inputs validated with Zod before DB write
- [x] All DB queries through `queryForOrg()`
- [x] No DB imports outside `src/lib/db/`
- [x] No TypeScript `any` except raw DB boundaries
- [x] RLS on `tickets` table
- [x] addReply body stored as JSON `{ type: 'reply'|'note', content: string }`
- [x] resolved_at set/cleared based on status transition
- [x] deleteTicket: admin only
- [x] Thread merges activities + email_messages sorted by occurred_at
- [x] SLA countdown computed client-side from sla_due_at; server not polled
- [x] Vitest unit tests for all actions
- [x] Playwright E2E for ticket creation, reply, status change, note flows

## Scope Boundaries

- Email sending (outbound replies via Resend) is in module 010-email.
- Email messages in thread are read-only in this module; populated by 010-email webhook.
- SLA rule engine (auto-set sla_due_at based on priority) is out of scope for v1.
- Bulk ticket actions are out of scope for v1.

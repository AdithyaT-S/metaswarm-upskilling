# 008 — Support Tickets Module

## User Stories

**US-1**: As a support agent, I can view a list of tickets filtered by status and priority so I can triage my queue.

**Acceptance**: Ticket list shows subject, contact, status badge, priority badge, SLA countdown, and assignee. Filters by status (Open/Pending/Resolved/Closed) and priority (Low/Medium/High/Urgent) work independently.

**US-2**: As a support agent, I can view a ticket's thread of replies and internal notes in chronological order.

**Acceptance**: Thread view merges activity replies/notes + email_messages sorted by occurred_at. Each item shows direction (inbound/outbound), author, and timestamp.

**US-3**: As a support agent, I can reply to a ticket or add an internal note from the thread panel.

**Acceptance**: Reply form sends addReply with type='reply'. Note form sends type='note'. Both appear in the thread immediately (after revalidation). Optional: new_status can be set with the reply.

**US-4**: As a support agent, I can change ticket status (e.g., from Open to Resolved) and see SLA remaining time.

**Acceptance**: Status change from thread or status dropdown triggers updateTicket. Setting status=resolved sets resolved_at. SLA timer shows time remaining relative to sla_due_at.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | List tickets: paginated, filtered by status and priority |
| FR-02 | Search tickets by subject |
| FR-03 | SLA countdown in list: time remaining = sla_due_at - now(); red if overdue |
| FR-04 | Create ticket: subject, contact_id, priority, assignee_id, sla_due_at optional |
| FR-05 | Ticket detail: thread view merging activities (reply/note) + email_messages by occurred_at |
| FR-06 | Thread items distinguish inbound email, outbound email, reply, and internal note |
| FR-07 | addReply: type='reply' or 'note'; body stored as JSON in activity body; optional new_status |
| FR-08 | Changing status to 'resolved' sets resolved_at = now() |
| FR-09 | Changing status away from 'resolved' clears resolved_at |
| FR-10 | updateTicket: subject, priority, assignee_id, status, sla_due_at |
| FR-11 | deleteTicket: admin only |
| FR-12 | Thread replies show avatar/initials of author |
| FR-13 | Internal notes visually distinguished from customer-facing replies (different background) |
| FR-14 | Ticket linked to contact; contact card shown on detail page |

---

## Key Entities

- `tickets` — primary table
- `activities` — replies and notes (type='email' or 'note' with JSON body)
- `email_messages` + `email_threads` — inbound/outbound emails (populated by email module)
- `contacts` — linked contact
- `users` — assignee picker

---

## Success Criteria

1. Thread view loads all replies, notes, and email messages in correct chronological order.
2. SLA countdown is accurate to the minute.
3. addReply creates an activity record with correct JSON body structure.
4. Status change to resolved sets resolved_at; moving away clears it.
5. Internal notes are visually distinct from customer replies.

---

## Assumptions

- Email messages in the thread are populated by the email module (010-email). In this module, the thread view handles them as read-only items.
- SLA is manually set (no automatic SLA rule engine in v1).
- Priority is set at creation and can be updated by agents.
- sla_due_at is optional; if null, no SLA timer shown.
- Ticket deletion removes the ticket record; activities are CASCADE deleted.

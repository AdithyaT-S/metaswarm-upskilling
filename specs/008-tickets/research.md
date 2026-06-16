# Research — 008 Tickets

## Decision Log

### D-1: Thread Data Structure

**Decision**: Thread = activities (WHERE ticket_id=X AND type IN ('email','note')) + email_messages (WHERE ticket_id=X) merged in application code, sorted by `occurred_at` (= activity.created_at or email_message.sent_at).

**Rationale**: Activities and email_messages are in separate tables with different schemas. A UNION query or application-level merge are both workable; application merge is simpler to type-check.

**Alternatives**: DB-level UNION with CASE — possible but complicates the query and requires a shared column set.

---

### D-2: Reply Body Storage

**Decision**: Replies and notes are stored as `activities` with `type='note'` (or a new type — use 'note' for internal, 'email' for reply). Body is JSON: `{ kind: 'reply'|'note', content: string }`.

**Rationale**: Reuses the existing activities table. JSON body allows structured metadata without a schema migration. The `kind` field distinguishes customer-visible replies from internal notes.

**Alternatives**: Separate `ticket_comments` table — cleaner schema but additional table, migration, and join for an already-complex thread query.

---

### D-3: resolved_at Lifecycle

**Decision**: `updateTicket` and `addReply` (via new_status) check status transition:
- status → 'resolved': SET resolved_at = now()
- status → anything else (when previously resolved): SET resolved_at = NULL

**Rationale**: resolved_at is the authoritative timestamp for SLA resolution metrics in Reports.

**Alternatives**: Track all status changes in a history table — overkill for v1.

---

### D-4: SLA Countdown Client-Side

**Decision**: `sla_due_at` is sent to the client as an ISO string. A `SlaTimer` client component uses `setInterval(1000)` to update the countdown display. No polling of the server.

**Rationale**: Server polling for SLA is wasteful. The countdown only needs to be accurate to the minute for support agents.

**Alternatives**: Server-Sent Events or WebSockets for real-time updates — out of scope for v1.

---

### D-5: Ticket Detail Layout

**Decision**: Split-pane layout: left pane = ticket metadata + contact card; right pane = thread view + reply box. On mobile, tabs.

**Rationale**: Matches Stitch screen design. Agents need metadata and thread visible simultaneously.

**Alternatives**: Single scrolling page — simpler but less ergonomic for support agents replying frequently.

---

### D-6: addReply new_status

**Decision**: `addReply` accepts optional `new_status`. If provided, it also updates the ticket status in the same transaction-like sequence (two UPDATE queries; not a true DB transaction but acceptable for v1).

**Rationale**: Agents often resolve a ticket when sending the final reply. Combining both saves a separate action call.

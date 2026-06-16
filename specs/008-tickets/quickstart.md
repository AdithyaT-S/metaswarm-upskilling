# Quickstart & Validation — 008 Tickets

## Validation Scenarios

### Scenario 1: Create and View a Ticket

1. Navigate to `/tickets/new`.
2. Fill in Subject="Login issue", Contact=(select a contact), Priority="High", SLA Due=(tomorrow).
3. Submit → redirected to `/tickets/<id>`.
4. Verify: ticket detail shows subject, contact card, priority badge, SLA countdown.

### Scenario 2: Add a Reply

1. Open a ticket detail page.
2. In the reply box, type "We're looking into this." with Type=Reply.
3. Submit.
4. Verify: reply appears in thread with your name, timestamp, and "outbound" styling.

### Scenario 3: Add an Internal Note

1. Open a ticket detail page.
2. Switch to "Note" tab, type "Escalated to tier 2."
3. Submit.
4. Verify: note appears in thread with different background color (internal note styling).
5. Verify: note is NOT visible in the customer-facing context (internal distinction in UI).

### Scenario 4: Resolve Ticket via Reply

1. Open an open ticket.
2. In reply box, type "This has been resolved." and select new_status="Resolved".
3. Submit.
4. Verify: ticket status changes to "Resolved". resolved_at is set (check DB or API response).
5. Reopen by changing status back to "Open" → verify resolved_at is cleared.

### Scenario 5: SLA Overdue Indicator

1. Create a ticket with sla_due_at = 1 minute ago (past).
2. Navigate to `/tickets`.
3. Verify: SLA column shows negative time or "Overdue" in red for that ticket.

### Scenario 6: Filter by Status and Priority

1. Navigate to `/tickets`.
2. Select Status="Open" filter → only open tickets shown.
3. Add Priority="High" → further narrowed.
4. Clear all filters → all tickets return.

---

## Unit Test Targets (`src/app/actions/__tests__/tickets.test.ts`)

- `createTicket`: required field validation
- `updateTicket`: resolved_at lifecycle (set on resolved, clear on others)
- `addReply`: creates activity with JSON body; new_status updates ticket
- `deleteTicket`: admin only
- Thread merge: activities + email_messages sorted correctly

## E2E Test Files

- `e2e/tickets/list.spec.ts` — filter, SLA indicator
- `e2e/tickets/create.spec.ts` — create ticket form
- `e2e/tickets/thread.spec.ts` — reply, note, thread display
- `e2e/tickets/resolve.spec.ts` — status change via reply, resolved_at lifecycle

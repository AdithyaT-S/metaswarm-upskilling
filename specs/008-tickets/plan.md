# Implementation Plan — 008 Tickets

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| Provider isolation | PASS | All DB in src/lib/db/ |
| Multi-tenancy | PASS | queryForOrg() in all actions; RLS on tickets |
| Zod everywhere | PASS | Create/Update/AddReply/Search schemas |
| No `any` | PASS | ThreadItem typed at merge boundary |
| UI from Stitch | PASS | Stitch screen `fbfaee3f` fetched before design |
| Auth guard | PASS | getAuthUser() first in all actions |
| Admin check | PASS | deleteTicket guards user.role |
| resolved_at | PASS | Set/cleared correctly in updateTicket and addReply |

---

## Source Code Structure

```
src/app/actions/tickets.ts
src/app/(dashboard)/tickets/
  page.tsx                         # RSC: ticket list
  loading.tsx
  error.tsx
  new/page.tsx                     # Create ticket form
  [id]/page.tsx                    # Ticket detail (split-pane)
  _components/
    TicketsTable.tsx               # List with SLA column
    SlaTimer.tsx                   # Client component: live countdown
    TicketStatusBadge.tsx          # Color-coded status
    PriorityBadge.tsx              # Color-coded priority
    TicketForm.tsx                 # Create/edit form
    TicketMeta.tsx                 # Left pane: metadata + contact card
    ThreadView.tsx                 # Right pane: thread items
    ReplyBox.tsx                   # Reply/Note form
    ThreadItem.tsx                 # Single thread item (polymorphic)
src/app/actions/__tests__/tickets.test.ts
e2e/tickets/
```

---

## Implementation Phases

### Phase 1: DB + Server Actions
- SQL migration: tickets table, ticket_id column on activities, RLS
- Implement all 6 server actions including thread merge logic in getTicket
- Unit tests (including resolved_at lifecycle)

### Phase 2: Ticket List Page
- RSC with status/priority/assignee filters + subject search (URL params)
- `TicketsTable` with `SlaTimer` client component for countdown
- `TicketStatusBadge` + `PriorityBadge`
- loading.tsx + error.tsx

### Phase 3: Create Form
- `TicketForm`: subject, contact picker, priority select, assignee picker, SLA date-time picker
- `tickets/new/page.tsx`

### Phase 4: Ticket Detail — Thread View
- `tickets/[id]/page.tsx` RSC: calls getTicket(id), renders split-pane layout
- `TicketMeta`: left pane with all ticket fields + contact card + inline status change
- `ThreadView`: renders sorted ThreadItems
- `ThreadItem`: polymorphic — reply (blue), note (yellow), email_inbound (grey), email_outbound (blue-light)
- `ReplyBox`: tab-switch between Reply and Note; optional new_status select; calls addReply

### Phase 5: E2E Tests

---

## Key Implementation Notes

- `SlaTimer` is a Client Component. It receives `sla_due_at` as a prop and uses `useEffect` + `setInterval` to update a formatted countdown string every 60 seconds.
- Thread merge in `getTicket`: fetch activities + email_messages, map both to `ThreadItem[]` with an `occurred_at` field, sort by `occurred_at`.
- `addReply` body JSON structure: `{ kind: 'reply' | 'note', content: string }`. The `ThreadItem` component parses this JSON when rendering an activity.
- On mobile, `tickets/[id]/page.tsx` renders metadata and thread as tabs using shadcn/ui `Tabs`.
- Email messages in the thread are read-only in this module; they appear after module 010-email populates them via the inbound webhook.

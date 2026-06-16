# Tasks — 008 Tickets

## Phase 1: DB & Server Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T1-01 | SQL migration: tickets table, add ticket_id to activities, indexes, RLS | No | — |
| T1-02 | Implement listTickets, getTicket (with thread merge) | No | T1-01 |
| T1-03 | Implement createTicket, updateTicket (resolved_at lifecycle) | No | T1-01 |
| T1-04 | Implement deleteTicket (admin), addReply | No | T1-01 |
| T1-05 | Unit tests: all actions + resolved_at lifecycle + thread sort | Yes | T1-02, T1-03, T1-04 |

## Phase 2: Ticket List Page

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T2-01 | `SlaTimer.tsx`: client countdown from sla_due_at | Yes | — |
| T2-02 | `TicketStatusBadge.tsx` + `PriorityBadge.tsx` | Yes | — |
| T2-03 | `TicketsTable.tsx`: table with SlaTimer, badges, actions | No | T2-01, T2-02 |
| T2-04 | `tickets/page.tsx` RSC: list + filters | No | T2-03, T1-02 |
| T2-05 | loading.tsx + error.tsx | Yes | — |

## Phase 3: Create Form

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T3-01 | `TicketForm.tsx`: all fields with pickers | No | T1-02 |
| T3-02 | `tickets/new/page.tsx` | No | T3-01 |

## Phase 4: Ticket Detail

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T4-01 | `ThreadItem.tsx`: polymorphic display for all 4 kinds | No | T1-02 |
| T4-02 | `ReplyBox.tsx`: reply/note tabs + new_status select + addReply call | No | T1-04 |
| T4-03 | `ThreadView.tsx`: renders sorted ThreadItem list + ReplyBox | No | T4-01, T4-02 |
| T4-04 | `TicketMeta.tsx`: metadata, contact card, inline status dropdown | No | T2-02, T1-03 |
| T4-05 | `tickets/[id]/page.tsx` RSC: split-pane layout | No | T4-03, T4-04 |

## Phase 5: E2E Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T5-01 | `e2e/tickets/list.spec.ts` | Yes | T2-04 |
| T5-02 | `e2e/tickets/create.spec.ts` | Yes | T3-02 |
| T5-03 | `e2e/tickets/thread.spec.ts` | Yes | T4-05 |
| T5-04 | `e2e/tickets/resolve.spec.ts` | Yes | T4-05 |

---

## Agent Assignment

| Agent | Tasks |
|-------|-------|
| architect | T1-01, T1-02 (thread merge design) |
| coder | T1-02 through T4-05 |
| test-automator | T1-05, T5-01 through T5-04 |
| code-review | Thread merge correctness, addReply JSON body structure, resolved_at logic |

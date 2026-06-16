# Server Action Contracts — 008 Tickets

All actions in `src/app/actions/tickets.ts`.

---

## listTickets(params)

**Input**: `TicketSearchSchema`

**Output**: `{ data: { tickets: Array<Ticket & { contact_name: string | null, assignee_name: string | null }>, total: number } }`

**Query**: JOIN contacts (LEFT) + users (LEFT) for names; WHERE org_id + filters; ILIKE on subject if q present.

---

## getTicket(id)

**Input**: `id: string`

**Output**: `{ data: { ticket: Ticket, contact: Contact | null, thread: ThreadItem[] } }`

**ThreadItem**: `{ id, kind: 'reply'|'note'|'email_inbound'|'email_outbound', body: string, author: string, occurred_at: string }`

**Query**: Fetch ticket + contact JOIN. Fetch activities WHERE ticket_id=id. Fetch email_messages JOIN email_threads WHERE ticket_id=id. Merge + sort by occurred_at in application code.

---

## createTicket(data)

**Input**: `CreateTicketSchema`

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/tickets')`

---

## updateTicket(id, data)

**Input**: `UpdateTicketSchema`

**Validation**: If data.status === 'resolved' → set resolved_at = now(). If status present and !== 'resolved' → set resolved_at = NULL.

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/tickets')`, `revalidatePath('/tickets/[id]')`

---

## deleteTicket(id)

**Input**: `id: string`

**Validation**: user.role === 'admin'

**Output**: `{ data: { success: true } }` or `{ error }`

**Side effects**: `revalidatePath('/tickets')`

---

## addReply(data)

**Input**: `AddReplySchema` { ticket_id, type: 'reply'|'note', body, new_status? }

**Action**:
1. INSERT into activities: org_id, type='note', ticket_id, owner_id=user.id, body=JSON.stringify({ kind: type, content: body })
2. If new_status provided: UPDATE tickets SET status=new_status (+ handle resolved_at as per updateTicket logic)

**Output**: `{ data: { activity_id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/tickets/[id]')`

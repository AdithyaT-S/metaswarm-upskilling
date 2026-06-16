# Server Action Contracts — 010 Email

Server actions in `src/app/actions/email.ts`. Webhook in `src/app/api/webhooks/email/route.ts`.

---

## sendEmail(data) — Server Action

**Input**: `SendEmailSchema` { to, subject, body, contact_id?, ticket_id? }

**Process**:
1. `getAuthUser()` — auth check
2. Check monthly outbound count < 500 (free plan)
3. Find or create `email_thread` matching (contact_id or ticket_id) AND subject
4. Call `resend.emails.send({ from: process.env.EMAIL_FROM, to: [to], subject, text: body })`
5. INSERT into `email_messages` { thread_id, from_addr: EMAIL_FROM, to_addrs: [to], body_html: body, direction: 'outbound', provider_message_id: resend_id, sent_at: now() }

**Output**: `{ data: { message_id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/contacts/[id]')` and/or `revalidatePath('/tickets/[id]')`

---

## handleInboundEmail(data) — Route Handler (NOT a Server Action)

**Endpoint**: POST `/api/webhooks/email`

**Auth**: Check `X-Webhook-Secret` header === `process.env.EMAIL_WEBHOOK_SECRET`

**Input**: Raw JSON body parsed as `InboundEmailSchema`

**Process**:
1. Verify webhook secret
2. Upsert email_message by provider_message_id (INSERT ... ON CONFLICT DO NOTHING)
3. Find matching email_thread by looking up contact with email = from_addr, and/or matching subject
4. If no thread found: find contact by email, create new thread with found contact_id
5. Link message to thread; link thread to ticket if ticket_id in existing thread

**Output**: HTTP 200 `{ ok: true }` or HTTP 400/401

---

## getEmailThreads(contactId?) — Server Action

**Input**: `contactId?: string`

**Output**: `{ data: EmailThread[] }`

**Query**: SELECT from email_threads WHERE org_id = current AND (contact_id = $contactId OR contactId null → all threads)

---

## getEmailThread(threadId) — Server Action

**Input**: `threadId: string`

**Output**: `{ data: { thread: EmailThread, messages: EmailMessage[] } }`

**Query**: Fetch thread + messages WHERE thread_id = $threadId ORDER BY sent_at ASC.

---

## Shared Components (not Server Actions)

### EmailComposer (`src/components/shared/EmailComposer.tsx`)
- Props: `contactId?, ticketId?, defaultTo?: string, onSent?: () => void`
- Renders: to (pre-filled), subject, body textarea, send button
- Calls `sendEmail` action on submit

### EmailThreadView (`src/components/shared/EmailThreadView.tsx`)
- Props: `contactId?, ticketId?`
- Calls `getEmailThreads` or `getEmailThread` to load messages
- Renders messages sorted by sent_at with direction styling

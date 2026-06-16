# Quickstart & Validation — 010 Email

## Validation Scenarios

### Scenario 1: Send Email from Contact Detail

1. Navigate to `/contacts/<id>` for a contact with a known email address.
2. Click "Send Email" → EmailComposer appears.
3. Verify: `to` field pre-filled with contact's email.
4. Enter Subject="Hello" and body="Just checking in."
5. Click Send.
6. Verify: success toast; EmailThreadView shows the sent message.
7. Check DB: email_messages row with direction='outbound'.

### Scenario 2: Send Email from Ticket Detail

1. Navigate to `/tickets/<id>` with a contact linked.
2. Click "Reply via Email" → EmailComposer appears.
3. Send email.
4. Verify: message appears in ticket thread view (via EmailThreadView in thread).

### Scenario 3: Free Plan Limit

1. Set up a test org with 500 outbound emails this month (or mock the count).
2. Attempt to send email 501.
3. Verify: action returns "Your plan allows 500 emails per month."

### Scenario 4: Inbound Webhook — New Message

1. POST to `/api/webhooks/email` with header `X-Webhook-Secret: <correct-secret>` and body:
   ```json
   { "from": "customer@example.com", "to": ["org@freshcrm.io"], "subject": "Hello", "body_html": "<p>Hi</p>", "provider_message_id": "ext-001" }
   ```
2. Verify: HTTP 200 response.
3. Verify: email_message row created with direction='inbound'.
4. POST same payload again → verify second call returns 200 but no duplicate message created.

### Scenario 5: Webhook — Wrong Secret

1. POST to `/api/webhooks/email` with wrong or missing `X-Webhook-Secret`.
2. Verify: HTTP 401 response.

### Scenario 6: EmailThreadView Shows Both Directions

1. Ensure a thread has both an inbound and outbound message.
2. Navigate to the contact detail page with that thread.
3. Verify: EmailThreadView renders inbound message with sender address, outbound with "You".
4. Messages are in chronological order (sent_at ASC).

---

## Unit Test Targets (`src/app/actions/__tests__/email.test.ts`)

- `sendEmail`: auth check, plan limit, find-or-create thread, Resend call mocked
- `handleInboundEmail`: secret validation, deduplication (provider_message_id), contact lookup
- `getEmailThread`: messages sorted by sent_at ASC

## E2E Test Files

- `e2e/email/send.spec.ts` — send from contact detail, thread appears
- `e2e/email/webhook.spec.ts` — inbound webhook scenarios (may require direct API calls)
- `e2e/email/thread-view.spec.ts` — thread renders correctly in contact + ticket context

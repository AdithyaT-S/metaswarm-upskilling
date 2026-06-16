# Data Model — 010 Email

## Tables

### email_threads
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK→orgs | NOT NULL |
| subject | text | NOT NULL |
| contact_id | uuid FK→contacts | nullable; ON DELETE SET NULL |
| ticket_id | uuid FK→tickets | nullable; ON DELETE SET NULL |
| created_at | timestamptz | DEFAULT now() |

### email_messages
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| thread_id | uuid FK→email_threads | NOT NULL; ON DELETE CASCADE |
| from_addr | text | NOT NULL |
| to_addrs | text[] | NOT NULL |
| body_html | text | |
| direction | text | CHECK IN ('inbound','outbound'); NOT NULL |
| provider_message_id | text | UNIQUE; nullable (for dedup) |
| sent_at | timestamptz | NOT NULL |

---

## Zod Schemas

```ts
// SendEmailSchema
{
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  contact_id: z.string().uuid().optional(),
  ticket_id: z.string().uuid().optional(),
}
// Refinement: at least one of contact_id or ticket_id recommended

// InboundEmailSchema (from webhook body)
{
  from: z.string().email(),
  to: z.array(z.string().email()),
  subject: z.string(),
  body_html: z.string().optional(),
  body_text: z.string().optional(),
  provider_message_id: z.string(),
  // contact matching done by looking up from_addr in contacts.email
}
```

---

## SQL Migration

```sql
CREATE TABLE IF NOT EXISTS email_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  subject text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES tickets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
  from_addr text NOT NULL,
  to_addrs text[] NOT NULL DEFAULT '{}',
  body_html text,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  provider_message_id text UNIQUE,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_messages_thread ON email_messages(thread_id);
CREATE INDEX IF NOT EXISTS email_threads_contact ON email_threads(contact_id);
CREATE INDEX IF NOT EXISTS email_threads_ticket ON email_threads(ticket_id);
```

---

## RLS Policies

```sql
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_threads_org ON email_threads USING (org_id = current_org_id());

-- email_messages: access via thread's org
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_messages_org ON email_messages
  USING (thread_id IN (SELECT id FROM email_threads WHERE org_id = current_org_id()));
```

# Data Model — 008 Tickets

## Tables

### tickets
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK→orgs | NOT NULL |
| subject | text | NOT NULL |
| status | text | CHECK IN ('open','pending','resolved','closed'); DEFAULT 'open' |
| priority | text | CHECK IN ('low','medium','high','urgent'); DEFAULT 'medium' |
| contact_id | uuid FK→contacts | nullable |
| assignee_id | uuid FK→users | nullable |
| sla_due_at | timestamptz | nullable |
| resolved_at | timestamptz | set when status='resolved' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### activities (shared; created by addReply for tickets)
Uses existing activities table with ticket_id FK and body as JSON `{ kind: 'reply'|'note', content: string }`.

### email_threads + email_messages (populated by 010-email; read here)
| tickets.id linked via email_threads.ticket_id |

---

## Zod Schemas

```ts
// CreateTicketSchema
{
  subject: z.string().min(1),
  contact_id: z.string().uuid().optional(),
  priority: z.enum(['low','medium','high','urgent']).default('medium'),
  assignee_id: z.string().uuid().optional(),
  sla_due_at: z.string().datetime().optional(),
}

// UpdateTicketSchema — all optional
{
  subject: z.string().min(1).optional(),
  status: z.enum(['open','pending','resolved','closed']).optional(),
  priority: z.enum(['low','medium','high','urgent']).optional(),
  assignee_id: z.string().uuid().optional().nullable(),
  sla_due_at: z.string().datetime().optional().nullable(),
}

// AddReplySchema
{
  ticket_id: z.string().uuid(),
  type: z.enum(['reply','note']),
  body: z.string().min(1),
  new_status: z.enum(['open','pending','resolved','closed']).optional(),
}

// TicketSearchSchema
{
  status: z.enum(['open','pending','resolved','closed']).optional(),
  priority: z.enum(['low','medium','high','urgent']).optional(),
  q: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(25),
}
```

---

## SQL Migration

```sql
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','pending','resolved','closed')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high','urgent')),
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  sla_due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add ticket_id to activities table (if not already present)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS tickets_org_status ON tickets(org_id, status);
```

---

## RLS Policy

```sql
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tickets_org ON tickets USING (org_id = current_org_id());
```

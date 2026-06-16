# Data Model — 009 Activities

## Tables

### activities (shared table — also used by tickets module)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK→orgs | NOT NULL |
| type | text | CHECK IN ('call','email','note','task','meeting'); NOT NULL |
| body | text | plain text or JSON (for ticket replies) |
| contact_id | uuid FK→contacts | nullable; ON DELETE SET NULL |
| lead_id | uuid FK→leads | nullable; ON DELETE SET NULL |
| deal_id | uuid FK→deals | nullable; ON DELETE SET NULL |
| ticket_id | uuid FK→tickets | nullable; ON DELETE SET NULL |
| owner_id | uuid FK→users | nullable; ON DELETE SET NULL |
| due_at | timestamptz | for tasks |
| done_at | timestamptz | set when task completed |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

---

## Zod Schemas

```ts
// CreateActivitySchema (parsed from FormData)
{
  type: z.enum(['call','email','note','task','meeting']),
  body: z.string().optional(),
  contact_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  ticket_id: z.string().uuid().optional(),
  owner_id: z.string().uuid().optional(),
  due_at: z.string().datetime().optional(),
  done_at: z.string().datetime().optional(),
}
// Refinement: if type === 'task', due_at is recommended (not enforced in v1)

// UpdateActivitySchema — type excluded, all other fields optional

// ActivitySearchSchema
{
  type: z.enum([...]).optional(),
  owner_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  ticket_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  q: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(25),
}
```

---

## SQL Migration

```sql
-- activities table (may already exist from tickets module migration)
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('call','email','note','task','meeting')),
  body text,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  due_at timestamptz,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_org_type ON activities(org_id, type);
CREATE INDEX IF NOT EXISTS activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS activities_deal_id ON activities(deal_id);
CREATE INDEX IF NOT EXISTS activities_ticket_id ON activities(ticket_id);
CREATE INDEX IF NOT EXISTS activities_owner_due ON activities(owner_id, due_at);
```

---

## RLS Policy

```sql
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY activities_org ON activities USING (org_id = current_org_id());
```

# Data Model — 006 Leads

## Tables

### leads
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| org_id | uuid FK→orgs | NOT NULL |
| contact_id | uuid FK→contacts | NOT NULL |
| status | text | NOT NULL DEFAULT 'New'; CHECK IN ('New','Contacted','Qualified','Unqualified','Converted') |
| score | int | NOT NULL DEFAULT 0; CHECK 0–100 |
| source | text | one of LEAD_SOURCES |
| owner_id | uuid FK→users | nullable |
| notes | text | |
| converted_at | timestamptz | NULL = not converted |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

---

## Zod Schemas

```ts
// CreateLeadSchema
{
  contact_id: z.string().uuid(),
  status: z.enum(['New','Contacted','Qualified','Unqualified','Converted']).default('New'),
  score: z.number().int().min(0).max(100).default(0),
  source: z.enum(LEAD_SOURCES).optional(),
  owner_id: z.string().uuid().optional(),
  notes: z.string().optional(),
}

// UpdateLeadSchema — contact_id excluded (immutable)
{
  status: z.enum([...]).optional(),
  score: z.number().int().min(0).max(100).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  owner_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
}

// UpdateLeadStatusSchema
{
  id: z.string().uuid(),
  status: z.enum(['New','Contacted','Qualified','Unqualified','Converted']),
}

// LeadSearchSchema
{
  status: z.enum([...]).optional(),
  owner_id: z.string().uuid().optional(),
  q: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(25),
}
```

---

## SQL Migration

```sql
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'New'
    CHECK (status IN ('New','Contacted','Qualified','Unqualified','Converted')),
  score int NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source text,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  converted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_org_id_idx ON leads(org_id);
CREATE INDEX IF NOT EXISTS leads_contact_id_idx ON leads(contact_id);
```

---

## RLS Policy

```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_org ON leads
  USING (org_id = current_org_id());
```

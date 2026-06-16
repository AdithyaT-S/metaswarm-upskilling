# Data Model — 005 Contacts

## Tables

### contacts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| org_id | uuid FK→orgs | NOT NULL |
| first_name | text | NOT NULL |
| last_name | text | |
| email | text | UNIQUE per org (partial unique index) |
| phone | text | |
| company | text | |
| job_title | text | |
| lead_source | text | one of LEAD_SOURCES enum |
| owner_id | uuid FK→users | nullable |
| tags | text[] | DEFAULT '{}' |
| custom_fields | jsonb | DEFAULT '{}' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |
| deleted_at | timestamptz | NULL = not deleted |

### custom_field_definitions (read by this module; managed in 012-settings)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK→orgs | |
| entity_type | text | 'contact' in v1 |
| field_name | text | machine key |
| field_type | text | text/number/date/boolean/select |
| options | text[] | for select type |
| is_required | bool | |
| position | int | render order |

---

## Zod Schemas

```ts
// CreateContactSchema
{
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  lead_source: z.enum(LEAD_SOURCES).optional(),
  owner_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.unknown()).default({}),
}

// UpdateContactSchema — same fields, all optional, plus id
// ContactSearchSchema
{
  q: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  lead_source: z.enum(LEAD_SOURCES).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
}
```

---

## SQL Migrations

```sql
-- contacts table (if not already created in 002-auth)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text,
  email text,
  phone text,
  company text,
  job_title text,
  lead_source text,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  custom_fields jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Partial unique index: email unique per org among non-deleted
CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_org_unique
  ON contacts (org_id, email)
  WHERE deleted_at IS NULL AND email IS NOT NULL;

-- custom_field_definitions
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  entity_type text NOT NULL DEFAULT 'contact',
  field_name text NOT NULL,
  field_type text NOT NULL,
  options text[] NOT NULL DEFAULT '{}',
  is_required boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, entity_type, field_name)
);
```

---

## RLS Policies

```sql
-- contacts: org isolation
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_org ON contacts
  USING (org_id = current_org_id());

-- custom_field_definitions: org isolation
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cfd_org ON custom_field_definitions
  USING (org_id = current_org_id());
```

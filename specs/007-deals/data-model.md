# Data Model — 007 Deals

## Tables

### deals
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK→orgs | NOT NULL |
| name | text | NOT NULL |
| pipeline_id | uuid FK→pipelines | NOT NULL |
| stage_id | uuid FK→pipeline_stages | NOT NULL |
| value | numeric | DEFAULT 0 |
| currency | text | DEFAULT 'USD' |
| close_date | date | |
| contact_id | uuid FK→contacts | nullable |
| owner_id | uuid FK→users | nullable |
| status | text | CHECK IN ('open','won','lost'); DEFAULT 'open' |
| lost_reason | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### pipelines (read by this module; managed in 012-settings)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK→orgs | |
| name | text | |
| is_default | bool | DEFAULT false |
| created_at | timestamptz | |

### pipeline_stages (read by this module; managed in 012-settings)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| pipeline_id | uuid FK→pipelines | |
| name | text | |
| position | int | |
| probability | int | 0–100 |
| created_at | timestamptz | |

---

## Zod Schemas

```ts
// CreateDealSchema
{
  name: z.string().min(1),
  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  value: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  close_date: z.string().optional(), // ISO date string
  contact_id: z.string().uuid().optional(),
  owner_id: z.string().uuid().optional(),
}

// UpdateDealSchema — same but all optional, no pipeline_id change
// MoveDealStageSchema
{
  deal_id: z.string().uuid(),
  stage_id: z.string().uuid(),
}

// CloseDealSchema
{
  deal_id: z.string().uuid(),
  status: z.enum(['won','lost']),
  lost_reason: z.string().optional(),
}
```

---

## SQL Migration

```sql
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  position int NOT NULL DEFAULT 0,
  probability int NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  pipeline_id uuid NOT NULL REFERENCES pipelines(id),
  stage_id uuid NOT NULL REFERENCES pipeline_stages(id),
  value numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  close_date date,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','won','lost')),
  lost_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

## RLS Policies

```sql
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY pipelines_org ON pipelines USING (org_id = current_org_id());

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY stages_org ON pipeline_stages
  USING (pipeline_id IN (SELECT id FROM pipelines WHERE org_id = current_org_id()));

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deals_org ON deals USING (org_id = current_org_id());
```

# Data Model: Settings

**Feature**: 012-settings
**Date**: 2026-06-16

---

## Database Changes

**New table**: `custom_field_definitions` (if not already created by a prior migration)

```sql
CREATE TABLE custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL DEFAULT 'contact',
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text','number','date','boolean','select')),
  options JSONB NOT NULL DEFAULT '[]',
  is_required BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, entity_type, field_name)
);
```

RLS: `org_id = current_org_id()` on all operations. Admin-only mutations enforced in Server Actions (not RLS).

**Existing tables modified**: none. `orgs.plan`, `users.role`, `pipelines`, `pipeline_stages` already exist.

---

## Zod Schemas

```ts
// Profile
profileUpdateSchema = z.object({ full_name: z.string().min(1).max(100), avatar_url: z.string().url().optional().or(z.literal('')) })

// Team
inviteMemberSchema = z.object({ email: z.string().email(), role: z.enum(['admin','member','viewer']) })
updateMemberRoleSchema = z.object({ user_id: z.string().uuid(), role: z.enum(['admin','member','viewer']) })
removeMemberSchema = z.object({ user_id: z.string().uuid() })

// Pipelines
pipelineSchema = z.object({ name: z.string().min(1).max(100), is_default: z.boolean().optional() })
stageSchema = z.object({ pipeline_id: z.string().uuid(), name: z.string().min(1).max(100), position: z.number().int().min(0), probability: z.number().int().min(0).max(100) })
reorderStagesSchema = z.object({ pipeline_id: z.string().uuid(), stage_ids: z.array(z.string().uuid()) })

// Custom fields
customFieldSchema = z.object({ entity_type: z.literal('contact'), field_name: z.string().min(1).max(50), field_type: z.enum(['text','number','date','boolean','select']), options: z.array(z.string()).optional(), is_required: z.boolean().default(false) })
updateCustomFieldSchema = customFieldSchema.omit({ entity_type: true })
```

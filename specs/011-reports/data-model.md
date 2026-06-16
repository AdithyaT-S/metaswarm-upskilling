# Data Model: Reports

**Feature**: 011-reports
**Date**: 2026-06-16

---

## Database Changes

**None.** Reports are read-only aggregations over existing tables.

---

## Tables Read (no writes)

| Table | Columns used |
|-------|-------------|
| contacts | created_at, deleted_at, org_id |
| deals | value, status, stage_id, pipeline_id, created_at, org_id |
| pipeline_stages | id, name, position, pipeline_id |
| pipelines | id, name, is_default, org_id |
| tickets | status, resolved_at, sla_due_at, created_at, org_id |
| activities | type, owner_id, created_at, org_id |
| users | id, full_name, avatar_url, org_id |

---

## Report Data Shapes

### ReportsDashboardData

```ts
interface ReportsDashboardData {
  contacts: { total: number; change_pct: number | null; series: { week: string; count: number }[] }
  deals: { total_value: number; stages: { stage_name: string; position: number; value: number }[] }
  revenue: { total: number; change_pct: number | null; this_month: number; last_month: number }
  tickets: { total: number; sla_compliance_pct: number | null; statuses: { status: string; count: number }[] }
  team_activity: { total: number; members: TeamActivityMember[] }
}

interface TeamActivityMember {
  user_id: string; full_name: string; avatar_url: string | null
  calls: number; emails: number; meetings: number
}
```

### Filter Params (Zod)

```ts
reportFiltersSchema = z.object({
  date_preset: z.enum(['today','last_7_days','last_30_days','last_quarter','this_year','custom']).default('last_30_days'),
  date_from: z.string().optional(),  // ISO date — only for custom
  date_to: z.string().optional(),
  pipeline_id: z.string().uuid().optional(),
})
```

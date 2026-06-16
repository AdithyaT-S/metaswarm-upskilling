# Server Action Contracts: Reports

**Feature**: 011-reports
**Date**: 2026-06-16

---

## getReportsDashboard

```ts
async function getReportsDashboard(
  filters: { date_preset?: string; date_from?: string; date_to?: string; pipeline_id?: string }
): Promise<{ data: ReportsDashboardData } | { error: { message: string } }>
```

**Auth**: any authenticated user (all roles)  
**Validation**: `reportFiltersSchema.safeParse(filters)`  
**Queries**: 7 parallel sub-queries via `Promise.all` + `safeQuery` wrapper  
**Side effects**: none  
**Used by**: `src/app/(dashboard)/reports/page.tsx` (Server Component)

---

## getPipelinesForFilter

```ts
async function getPipelinesForFilter(): Promise<{ data: Pipeline[] } | { error: { message: string } }>
```

**Auth**: any authenticated user  
**Returns**: all pipelines for the org, ordered by `is_default DESC, name ASC`  
**Used by**: pipeline dropdown in reports filter bar

---

## exportReportsCSV

```ts
async function exportReportsCSV(filters: {
  date_preset?: string; date_from?: string; date_to?: string; pipeline_id?: string
  report_ids: string[]  // e.g. ['contacts','deals','revenue','tickets','team_activity']
}): Promise<{ data: { csv: string; filename: string } } | { error: { message: string } }>
```

**Auth**: any authenticated user  
**Validation**: reuses `reportFiltersSchema` for date fields  
**Logic**: calls `getReportsDashboard` internally, formats selected sections to CSV string  
**Side effects**: none (no file stored — client does browser download)  
**Used by**: "Export CSV" button in `ReportsClient.tsx`

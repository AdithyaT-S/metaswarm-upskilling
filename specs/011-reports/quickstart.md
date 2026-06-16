# Quickstart Validation Guide: Reports

**Feature**: 011-reports
**Date**: 2026-06-16

---

## Prerequisites

- All data modules (005–010) built with seed data in the DB
- `pnpm dev` running
- At least: 5 contacts, 3 open deals in 2+ stages, 2 tickets (1 resolved), 3 activities

---

## Scenario 1: Reports Page Loads

```
1. Log in and navigate to /reports
2. Verify: all 5 cards visible with data or empty states (not error screens)
3. Verify: no JS errors in console
```

---

## Scenario 2: Date Filter

```
1. On /reports, click the date filter dropdown
2. Select "Last 7 days"
3. Verify: all cards refresh; URL updates to ?date_preset=last_7_days
4. Select "Custom", enter a from date 1 month ago and today as to
5. Verify: data reflects only that range
```

---

## Scenario 3: Pipeline Filter

```
1. If org has multiple pipelines, select a specific pipeline from the pipeline dropdown
2. Verify: Open Deals by Stage card updates to show only that pipeline's stages
3. Other cards unchanged
```

---

## Scenario 4: CSV Export

```
1. Set date_preset=last_30_days
2. Click "Export CSV"
3. Verify: file downloads with name reports-export-<date>.csv
4. Open CSV; verify it contains sections for contacts, deals, revenue, tickets, team_activity
```

---

## Scenario 5: Empty/Error State

```
1. On a fresh org with no tickets, navigate to /reports
2. Verify: Tickets card shows "No data" empty state
3. Other cards with data still render correctly
```

---

## Unit Tests

```bash
pnpm vitest run src/lib/actions/reports.test.ts
```

Key test cases:
- `getReportsDashboard` with mocked `queryForOrg` returns correct aggregated shape
- `computeDateRange` for each preset returns correct from/to
- `exportReportsCSV` with `report_ids=['contacts']` returns CSV with contacts section only

## E2E Tests

```bash
pnpm playwright test --grep "reports"
```

Files:
- `e2e/reports/reports.spec.ts` — page load, date filter, CSV download

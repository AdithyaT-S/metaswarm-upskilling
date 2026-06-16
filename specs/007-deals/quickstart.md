# Quickstart & Validation — 007 Deals

## Validation Scenarios

### Scenario 1: Kanban Loads

1. Ensure a pipeline with at least 2 stages exists (create via Settings if needed).
2. Navigate to `/deals`.
3. Verify: Kanban renders one column per stage, each labeled with stage name.
4. Verify: Open deals appear in their respective stage columns.

### Scenario 2: Drag Deal to New Stage

1. In the Kanban, grab a deal card from Stage 1.
2. Drag it to Stage 2 column and drop.
3. Verify: Card appears in Stage 2 immediately (optimistic update).
4. Reload page → verify deal is still in Stage 2 (persisted).

### Scenario 3: Create Deal from Scratch

1. Click "New Deal" button.
2. Fill in Name="Acme Contract", Pipeline=(select default), Stage=(select first stage), Value=10000.
3. Submit.
4. Verify: Deal card appears in the selected stage column.

### Scenario 4: Create Deal from Lead Conversion

1. Convert a lead (see module 006 scenario 4).
2. On `/deals/new?contactId=X&source=Y`, verify contact and source are pre-filled.
3. Complete remaining fields and submit.
4. Verify: Deal appears in Kanban with correct contact.

### Scenario 5: Close a Deal

1. Click a deal card to open the slide-over panel.
2. Click "Close Deal" → select "Won".
3. Verify: Deal disappears from Kanban (status=open filter).
4. Verify: Deal count for free plan decremented (can create another deal now).

### Scenario 6: Free Plan Limit

1. In a test org with 100 open deals.
2. Attempt to create deal 101.
3. Verify: action returns "Your plan allows up to 100 open deals."

---

## Unit Test Targets (`src/app/actions/__tests__/deals.test.ts`)

- `createDeal`: free plan limit enforcement, stage-pipeline validation
- `moveDealStage`: stage belongs to same pipeline; cross-pipeline move rejected
- `closeDeal`: status enum validation
- `deleteDeal`: admin-only

## E2E Test Files

- `e2e/deals/kanban.spec.ts` — Kanban loads, pipeline selector
- `e2e/deals/drag-drop.spec.ts` — drag card between stages
- `e2e/deals/create-close.spec.ts` — create deal, close as won/lost
- `e2e/deals/slideover.spec.ts` — deal slide-over panel opens, displays details

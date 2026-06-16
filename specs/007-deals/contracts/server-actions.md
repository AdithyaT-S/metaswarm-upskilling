# Server Action Contracts — 007 Deals

All actions in `src/app/actions/deals.ts`. Pipeline actions in `src/app/actions/pipelines.ts` (managed in 012-settings; referenced here as read-only).

---

## getDealsForPipeline(pipelineId)

**Input**: `pipelineId: string`

**Output**: `{ data: { stages: Array<PipelineStage & { deals: Deal[] }> } }`

**Query**: Fetch stages for pipeline ordered by position. For each stage, fetch deals WHERE stage_id=X AND status='open' ORDER BY updated_at DESC. (Can be done as two queries: stages + all open deals for pipeline, then group in JS.)

---

## getDeal(id)

**Input**: `id: string`

**Output**: `{ data: { deal: Deal, contact: Contact | null, pipeline: Pipeline, stage: PipelineStage } }`

---

## getContactOptions() / getOrgMembers()

Same as contacts module — reuse or duplicate minimal query.

---

## createDeal(input)

**Input**: `CreateDealSchema`

**Validation**: Count open deals for org < 100 (free plan). Verify stage_id belongs to pipeline_id.

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/deals')`

---

## updateDeal(id, input)

**Input**: `UpdateDealSchema`

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/deals')`

---

## moveDealStage(input)

**Input**: `MoveDealStageSchema` { deal_id, stage_id }

**Validation**: Verify stage belongs to deal's pipeline: SELECT pipeline_id FROM pipeline_stages WHERE id = $stage_id → must equal deal.pipeline_id.

**Action**: UPDATE deals SET stage_id = $stage_id, updated_at = now()

**Output**: `{ data: { success: true } }` or `{ error: { message: 'Invalid stage for this pipeline' } }`

**Side effects**: `revalidatePath('/deals')`

---

## closeDeal(input)

**Input**: `CloseDealSchema` { deal_id, status: 'won'|'lost', lost_reason? }

**Action**: UPDATE deals SET status=$status, lost_reason=$lost_reason

**Output**: `{ data: { success: true } }` or `{ error }`

**Side effects**: `revalidatePath('/deals')`

---

## deleteDeal(id)

**Input**: `id: string`

**Validation**: user.role === 'admin'

**Output**: `{ data: { success: true } }` or `{ error }`

**Side effects**: `revalidatePath('/deals')`

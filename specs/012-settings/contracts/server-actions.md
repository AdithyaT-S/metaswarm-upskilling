# Server Action Contracts: Settings

**Feature**: 012-settings

---

## Profile

| Action | Input | Output | Side effects |
|--------|-------|--------|-------------|
| `getMyProfile()` | — | `{ data: { id, full_name, email, avatar_url, role } }` | none |
| `updateProfile(input)` | `profileUpdateSchema` | `{ data: updated_user }` | `revalidatePath('/settings')` |

---

## Team

| Action | Input | Output | Side effects |
|--------|-------|--------|-------------|
| `getTeamMembers()` | — | `{ data: User[] }` ordered by created_at | none |
| `inviteMember(input)` | `inviteMemberSchema` | `{ data: new_user }` | `revalidatePath('/settings')` |
| `updateMemberRole(input)` | `updateMemberRoleSchema` | `{ data: updated_user }` | `revalidatePath('/settings')` |
| `removeMember(input)` | `removeMemberSchema` | `{ success: true }` | nullifies owner/assignee on contacts/leads/deals/tickets; deletes user; `revalidatePath('/settings')` |

**Role guards**: `inviteMember`, `updateMemberRole`, `removeMember` — reject if `user.role !== 'admin'`.  
**Self-protection**: `updateMemberRole` + `removeMember` reject if `input.user_id === user.id`.  
**Plan limit**: `inviteMember` rejects on free plan with ≥3 users.

---

## Pipelines

| Action | Input | Output | Side effects |
|--------|-------|--------|-------------|
| `getPipelines()` | — | `{ data: Pipeline[] }` | none |
| `getPipelineWithStages(id)` | pipelineId | `{ data: PipelineStage[] }` | none |
| `createPipeline(input)` | `pipelineSchema` | `{ data: { pipeline, stages } }` with 6 default stages | `revalidatePath('/settings')` |
| `updatePipeline(id, input)` | `pipelineSchema.partial()` | `{ data: pipeline }` | `revalidatePath('/settings')` |
| `deletePipeline(id)` | pipelineId | `{ success: true }` | closes open deals as 'lost'; `revalidatePath('/settings')` |
| `createStage(input)` | `stageSchema` | `{ data: stage }` | `revalidatePath('/settings')` |
| `updateStage(id, input)` | `stageSchema.partial()` | `{ data: stage }` | `revalidatePath('/settings')` |
| `deleteStage(id)` | stageId | `{ success: true }` | moves open deals to first remaining stage; `revalidatePath('/settings')` |
| `reorderStages(input)` | `reorderStagesSchema` | `{ success: true }` | updates position by array index; `revalidatePath('/settings')` |

**Role guards**: all pipeline mutations reject if `user.role !== 'admin'`.

---

## Custom Fields

| Action | Input | Output | Side effects |
|--------|-------|--------|-------------|
| `getCustomFields(entityType)` | `'contact'` | `{ data: CustomFieldDefinition[] }` ordered by position | none |
| `createCustomField(input)` | `customFieldSchema` | `{ data: field }` | `revalidatePath('/settings')` |
| `updateCustomField(id, input)` | `updateCustomFieldSchema` | `{ data: field }` | `revalidatePath('/settings')` |
| `deleteCustomField(id)` | fieldId | `{ success: true }` | `revalidatePath('/settings')` |

**Role guards**: all custom field mutations reject if `user.role !== 'admin'`.

---

## Billing

| Action | Input | Output | Side effects |
|--------|-------|--------|-------------|
| `getBillingInfo()` | — | `{ data: { plan, usage: { contacts, users, deals, emails } } }` | none |

**Role guard**: `getBillingInfo` rejects if `user.role !== 'admin'`.

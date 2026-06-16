# Quickstart Validation: Settings

**Feature**: 012-settings

---

## Prerequisites

- Auth module (002) implemented and running
- Logged in as an admin user
- At least one other user in the org

---

## Scenario 1 — Profile Tab

1. Navigate to `/settings?tab=profile`
2. Update "Full Name" to a new value → click Save
3. **Expected**: Toast "Profile updated". Refresh page → name persists. Topbar avatar initials update on next navigation.
4. Clear avatar URL → Save
5. **Expected**: Avatar falls back to initials in topbar.

---

## Scenario 2 — Team Tab (admin)

1. Navigate to `/settings?tab=team`
2. Click "Invite Member" → enter email `newuser@test.com`, role `member` → Submit
3. **Expected**: New row appears in team list immediately.
4. Click the role dropdown for the new user → select "viewer"
5. **Expected**: Role updates inline. No page reload required.
6. Click "Remove" on the new user → confirm dialog → confirm
7. **Expected**: User removed from list. Ownership fields nullified.

### Free plan limit

1. With 3 members on free plan, attempt to invite a 4th
2. **Expected**: Error "You've reached the 3-user limit on the free plan."

### Non-admin restriction

1. Log in as a non-admin member → navigate to `/settings?tab=team`
2. **Expected**: Invite button absent or disabled. Role dropdowns read-only.

---

## Scenario 3 — Pipelines Tab

1. Navigate to `/settings?tab=pipelines`
2. Click "New Pipeline" → name "Enterprise" → Save
3. **Expected**: Pipeline appears in list with 6 default stages.
4. Open the pipeline → click "Add Stage" → name "Discovery" → Save
5. **Expected**: Stage appears. Reflects in Deals Kanban on next load.
6. Drag a stage to a new position → release
7. **Expected**: Order persists after page reload.
8. Click "Delete Pipeline" on a non-default pipeline that has open deals → confirm
9. **Expected**: Open deals closed as "lost". Pipeline removed.

---

## Scenario 4 — Custom Fields Tab

1. Navigate to `/settings?tab=custom-fields`
2. Click "Add Field" → name "Contract Value", type "number", required: false → Save
3. **Expected**: Field appears in list. Navigate to new Contact form → "Contract Value" input is present.
4. Return to Custom Fields → delete the field
5. **Expected**: Field removed from list and from Contact form.
6. Attempt to add a field with the same name as an existing field
7. **Expected**: Error "A field with this name already exists."

---

## Scenario 5 — Billing Tab

1. Navigate to `/settings?tab=billing` as admin
2. **Expected**: Current plan shown (e.g., "Free"). Usage bars for Contacts, Users, Deals, Emails vs. free plan limits (500/3/100/500).
3. Navigate to billing as a non-admin
4. **Expected**: 403 or redirect, OR tab hidden in UI (per role guard implementation).

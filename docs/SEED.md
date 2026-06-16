# FreshCRM Seed Data

## Quick Start

```bash
# Apply migrations + seed in one go
npm run db:migrate && npm run db:seed
```

## Login

| Email | Password | Role |
|-------|----------|------|
| `admin@demo.com` | `password123` | Admin |
| `member@demo.com` | `password123` | Member |

## What Gets Seeded

| Entity | Count | Populated Fields |
|--------|-------|-----------------|
| **Orgs** | 1 | `Demo Corp`, free plan |
| **Users** | 2 | Full names, roles, hashed passwords |
| **Contacts** | 6 | All lead_sources, tags, custom_fields, phone, company, job_title, owners |
| **Pipeline** | 1 | "Sales Pipeline" — 6 stages (New → Qualified → Proposal → Negotiation → Closed Won → Closed Lost) |
| **Leads** | 4 | Different statuses, scores 10–85, sources, notes, owners |
| **Deals** | 5 | Across stages, 1 won, 1 lost (with reason), all linked to contacts, varied currencies/values |
| **Tickets** | 3 | Urgent/open, medium/pending, low/resolved — SLA on urgent, varied assignees |
| **Activities** | 5 | One per type (call, email, note, task, meeting), linked to contacts/deals/tickets, task has due_at |
| **Email** | 1 thread + 2 msgs | Inbound from contact + outbound reply, linked to ticket |

## How to Reset (Clear Everything)

### Option 1 — Full Docker wipe (destroys volumes)

```bash
npm run docker:reset && npm run db:migrate && npm run db:seed
```

### Option 2 — Schema reset (keeps Docker volumes)

```bash
npm run db:migrate:reset && npm run db:seed
```

### Option 3 — Re-seed only (keeps all existing data, deletes and re-inserts)

```bash
npm run db:seed
```

The seed script always deletes all rows before inserting, so it's safe to re-run.

## Data Design Notes

- All entities in a single org (Demo Corp) — no cross-org confusion
- Every FK-able field has at least one row populated and one row null (for testing null-state UI)
- Contacts cover all 6 lead_source enum values
- Deals test: different stages, statuses (open/won/lost), currencies, with/without close dates
- Tickets test: different priority/status combos, SLA date, resolved_at logic
- Activities test: all 5 types, linked to different parent entities, task has due_at

## Script Location

`scripts/seed.ts` — uses `pg.Pool` directly (same pattern as `scripts/migrate.ts`).

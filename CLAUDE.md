# FreshCRM

Production-grade multi-tenant B2B SaaS CRM (Freshworks-style).
Next.js 14 App Router + Postgres + TypeScript + Tailwind + shadcn/ui.
DB abstraction, auth, schema, migrations, CI/CD already built — we are building the application on top.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Project Constraints (Non-Negotiable)

- **Provider isolation**: never import `pg`, `supabase-js`, or `neon` outside `src/lib/db/`.
- **Multi-tenancy**: every DB query must be scoped to `org_id` via `queryForOrg()`.
- **Zod everywhere**: every Server Action input validated — no exceptions.
- **No `any`**: except at raw DB row boundaries.
- **UI from Stitch**: before writing any page or component, fetch the relevant Stitch screen via the `stitch-design` skill. Never design from scratch if a Stitch screen exists.
- **Library docs via Context7**: use the `find-docs` skill for any Next.js / Supabase / shadcn/ui / Zod API — never rely on training data for signatures.
- Read `SYSTEM_STATE.md` before starting any new module (live schema + patterns + gotchas).
- Full requirements: `docs/BRD.md`

<!-- SPECKIT START -->
Active feature: specs/002-auth-org-mgmt/
- Spec:      specs/002-auth-org-mgmt/spec.md
- Plan:      specs/002-auth-org-mgmt/plan.md
- Research:  specs/002-auth-org-mgmt/research.md
- Data Model: specs/002-auth-org-mgmt/data-model.md
- Contracts: specs/002-auth-org-mgmt/contracts/server-actions.md
- Quickstart: specs/002-auth-org-mgmt/quickstart.md
- Tasks:     specs/002-auth-org-mgmt/tasks.md
<!-- SPECKIT END -->

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Issue Tracking

Use `bd` for all task tracking. Run `bd prime` for full workflow context and session close protocol.

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```
<!-- END BEADS INTEGRATION -->

## Orchestration

Use `/start-task` to begin any tracked work. Use `/prime` to load project context before starting a module.

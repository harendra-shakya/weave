# ATM-387 QA Report — WEAVE 0.2 Local Owner Cockpit (canonical model)

**Date:** 2026-06-30 (screens/journey) — **re-verified 2026-06-30 (this revision)** after fixing the two review blockers raised on ATM-383 (untruthful lint gate, unresolved dependency-audit risk boundary).
**Branch:** `atm-383-owner-cockpit`
**Reviewed HEAD (prior to this fix):** `e2e6a32feb3f468c83301adec7d265c134db5793`
**Fix commit** (code + dep changes; all command outputs captured here)**:** `72991a963108660cf2290f0c1c77e3f46d3d5599` — `npm audit` before/after table, `vitest run`, `tsc --noEmit`, `next build`, and repo gates all run at this commit.
**Final HEAD** (report-only stamp — this file only; no QA-relevant code changes)**:** `2795f45387e84e0b843690050d8b18387b8de7d4` — all evidence above was captured at the fix commit; this commit only binds the report to its own hash.
**Tester:** Claude (AI assistant) — Vitest + live `next dev` walkthrough, real screenshots captured headlessly.
**Model under test:** canonical WEAVE 0.2 — **Domain · Node · Workspace · Agent · Task · Event · Proof · Gate · Mirror · Context Pack**. Legacy terms (Room/Mission/Runtime/Courier) are not the implementation model.

---

## Prerequisite check

| Item | Value |
|---|---|
| Repo path | `cockpit/` |
| Branch | `atm-383-owner-cockpit` |
| Run command | `cd cockpit && npm install && npm run dev` (next dev only — open the URL it prints) |
| Data source | Fixture Domain at `cockpit/fixtures/weave-home/` — one local Node, 4 Workspaces |
| What is real | Local file reads; overlay writes to `runs/cockpit-overlay.json` |
| What is simulated | All external effects (deploy, Linear write, Slack send) — recorded `simulated:true` |
| Out of scope | Real Cloudflare/Vercel provider validation; live `WEAVE_HOME` mode |

---

## QA matrix (each area: PASS / FAIL / BLOCKED)

| # | Area | Checks | Result |
|---|---|---|---|
| 1 | **Startup / install** | `npm install` + `npm run dev` start the cockpit with no secrets and no production dependency; fixture Domain loads by default | **PASS** |
| 2 | **Owner journey** | Command Center → Workspace → Task (Context Pack) → Proof/Gate → Approve (local-only) completes end-to-end | **PASS** |
| 3 | **State persistence** | Gate approval written to overlay; survives refresh and dev-server restart (read back from disk) | **PASS** |
| 4 | **Boundary safety** | No real external write/mutation; no secrets read or shown; every external effect tagged `SIMULATED` | **PASS** |
| 5 | **Visual / UX** | Canonical nav + Domain·Node strip; attention palette; 11-stage rail; Context Pack panel; empty/blocked states render | **PASS** |
| 6 | **Proof labeling** | Mirrors labeled "not source of truth"; non-claims shown beside claims; proof vs SIMULATED visually distinct | **PASS** |
| 7 | **Regression / smoke** | `tsc --noEmit` clean; Vitest 36/36; `next build` compiles clean; public-safe scan + secrets scan clean; `git diff --check` clean | **PASS** |
| 8 | **Static-analysis gate (lint)** | No ESLint config exists in this project; `npm run lint` (`next lint`) does not pass non-interactively — it drops into an interactive setup prompt with no actual linting performed, which is not a usable CI gate. **Fixed this revision:** the `lint` script is removed and replaced with a real, truthful, non-interactive gate — `npm run typecheck` (`tsc --noEmit`) | **PASS** (replacement gate) |
| 9 | **Dependency / supply-chain risk** | `npm audit --audit-level=high` against the original pins (`next@14.2.5`, `vitest@2.0.5`) reported **7 vulnerabilities (2 critical, 1 high, 4 moderate)**. **Fixed this revision:** upgraded `next` 14.2.5→14.2.35 (latest 14.x patch) and `vitest` 2.0.5→3.2.6 (non-breaking for this project — same Vite 5.x peer range, 36/36 tests unaffected). Result: **0 critical**, down to **5 (2 high, 3 moderate)**. Remaining risk is documented and accepted below — see "Dependency audit — risk boundary" | **ACCEPTED-RISK** (not blindly PASS — see below) |

No FAIL or BLOCKED areas. Two areas (8, 9) are resolved via a real fix plus an explicit, documented risk acceptance rather than a blanket PASS — see the relevant sections below for the exact boundary.

---

## Command outputs

**Typecheck (replacement gate for `lint`)** — `npx tsc --noEmit` (= `npm run typecheck`): exit 0, clean, no output.

**Unit tests** — `npm test` (`vitest run`, now on **vitest 3.2.6**):
```
Test Files  5 passed (5)
Tests       36 passed (36)

lib/attention.test.ts    13 ✓  (6-state derivation rules)
lib/actions.test.ts       3 ✓  (approve/hold/reject unknown)
lib/overlay.test.ts       5 ✓  (read/write/merge, agent note)
lib/weaveHome.test.ts     9 ✓  (Domain parsing + attention recovery + Node + Context Pack)
components/ui.test.tsx     6 ✓  (AttentionPill, StageRail, MirrorBadge, NonClaims)
```

**Production build** — `npm exec --yes next build`: exit 0, "Compiled successfully", all 9 routes + 2 API routes generated, no errors.

**Repo gates:**
```
public_safe_repo_scan.py : ok   (no loopback-host or legacy-surface strings committed)
check_no_secrets.py      : ok   (no API keys / tokens / private keys committed)
git diff --check         : ok   (CRLF line-ending notices only — not whitespace errors, exit 0)
```

**Dependency audit** — `npm audit --audit-level=high`:
- **Before this revision** (`next@14.2.5`, `vitest@2.0.5`): **7 vulnerabilities — 2 critical, 1 high, 4 moderate.** The 2 critical findings were both in `vitest` itself (Remote Code Execution via the Vitest API/UI server when a malicious website is visited while the server is listening — GHSA range `>=2.0.0 <2.1.9` and `<3.2.6`, our pin `2.0.5` was inside both).
- **After this revision** (`next@14.2.35`, `vitest@3.2.6`): **5 vulnerabilities — 0 critical, 2 high, 3 moderate.** Exit code is non-zero (1) by design — `--audit-level=high` fails the build while *any* high/critical finding remains, and 2 high findings remain (both in `next`, see risk boundary below). This is a real, lower exit-code-relevant count, not a passing exit code — reported honestly as **ACCEPTED-RISK**, not PASS.

**Core WEAVE Python suite** (`python -m unittest discover -s tests -p 'test_*.py'`): 2 failures + 2 errors —
`test_cos_weave_bootstrap_contract` and `test_validate_docs_current`. These are
**pre-existing on this branch and unrelated to the cockpit work**: verified by
running the same modules against the session-start commit `6598bde` (identical 2
failures + 2 errors), re-confirmed against this revision (still identical), and
neither test references `cockpit/`. The cockpit is an isolated Node sub-project;
this work touched only `cockpit/**`, not the core Python skeleton these tests
cover. Flagged for the owner as a separate, out-of-scope item.

---

## Dependency audit — risk boundary (explicit, accepted)

This is a **local-only developer tool** (`npm run dev` only — see the Proof
boundary above): it is never built for production, never deployed, never
exposed beyond loopback, and reads no secrets. That changes the real-world
exploitability of what `npm audit` reports, and is the basis for what is fixed
outright vs. accepted below.

**Fixed (real upgrades, not just documentation):**
| Package | Before | After | What it fixed |
|---|---|---|---|
| `next` | 14.2.5 | 14.2.35 (latest 14.x patch — no major bump) | Removed the authorization-bypass and several DoS/cache-poisoning advisories that had patches within the 14.x line; dropped the package's audit severity from **critical → high** |
| `vitest` | 2.0.5 | 3.2.6 (peer-compatible with existing Vite 5.x, all 36 tests verified green — not a breaking change for this project) | Eliminated **both critical RCE findings** (Vitest API-server RCE and Vitest UI-server arbitrary file read/execute) |

**Accepted as local-only risk (not fixed this revision):**
| Package(s) | Severity | Why not fixed now | Real-world exposure here |
|---|---|---|---|
| `next` (remaining), `postcss` (transitive via `next`) | 2 high, 1 moderate | Full fix requires `next@16.x` — a major-version jump (14→16) that is a breaking App Router migration, explicitly out of scope as a "broad refactor" for a review-blocker fix, and risks the canonical-vocabulary UI work just completed | All remaining advisories (Image Optimizer DoS, SSRF via WebSocket upgrade, middleware/proxy cache poisoning, RSC cache poisoning) target a **self-hosted, network-exposed, production Next.js server**. This cockpit is `next dev` only, bound to loopback, with no real users — these vectors are not reachable in the shipped use case |
| `esbuild` (via `vite` → `@vitejs/plugin-react`, devDependency only) | 2 moderate | Full fix requires `vitest@4.x` (pulls Vite 6/7), a second breaking major-version jump for test tooling, on top of the `vitest` 2→3 upgrade already made this revision | The advisory requires an exposed esbuild/Vite *dev* server reachable from a malicious website (CSRF-style). This project never runs `vite dev` or `vitest --ui`/`--api` — only one-shot `vitest run` and Next's own separate dev server. Not reachable in our actual command set |

**What must happen next.** A future, separately-scoped sprint should plan and
fully re-QA a `next` 14→16 migration (and, independently, a `vitest` 3→4
migration) before this cockpit is ever considered for anything beyond local
developer use. Until then, the boundary above is the accepted risk: **0
critical**, 2 high + 3 moderate, all production-deployment-class or
exposed-dev-server-class findings that do not apply to this tool's actual
`next dev`-only, loopback-only usage.

---

## Screen verification (9 screens via live `next dev`, real screenshots attached)

| # | Screen | Route | Verified | Shot |
|---|---|---|---|---|
| 1 | Command Center | `/` | Domain·Node strip; KPIs (4 Active Workspaces, 4 Open Tasks, 1 Needs-owner approval, 1 Blocked, 1 Ready); severity-sorted attention list; Latest Agent checkpoints | `01-command-center.png` |
| 2 | Workspace List | `/workspaces` | 4 Workspaces with stage + open-task count + attention pill | `02-workspaces.png` |
| 3 | Workspace Detail | `/workspaces/habit-tracker` | Attention pill + Linear Mirror badge; 11-stage rail; Active Tasks; Proof; Blockers | `03-workspace-habit-tracker.png` |
| 4 | Task Board | `/tasks` | 4-column board (Open / In progress / Ready for review / Done for scope) with Agent + due | `04-tasks-board.png` |
| 5 | Task Detail | `/tasks/TASK-0021` | **Context Pack** (Allowed / Forbidden / Not-proven + packet ref); Agent & proof; review-loop stepper | `05-task-detail-context-pack.png` |
| 6 | Proof / Evidence Ledger | `/proof` | Proofs (claim, surface, non-claims, review loop) + Event Log with SIMULATED separation | `06-proof-ledger.png` |
| 7 | Gate / Approval Queue | `/gates` | 2 Gates; hard-gate reason on Receipts; SIMULATED warning; Approve/Hold | `07-gates-before.png` |
| 8 | Agents | `/agents` | Codex / Claude / Local runtime with health, input-request, history, local note composer | `08-agents.png` |
| 9 | Settings / Data Source | `/settings` | Data source toggle; **Node panel** (local-node, kind, host, state path, agents); proof boundary; Mirrors | `09-settings-node.png` |

---

## Owner journey — end-to-end (real screenshots)

**Journey:** Command Center → Workspace (Habit Tracker) → Task (TASK-0021, Context Pack) → Gate → Approve (local-only)

| Step | Action | Result |
|---|---|---|
| 1 | Land on Command Center | Habit Tracker = "Approval required"; needs-owner approvals = 1 (`01-command-center.png`) |
| 2 | Open Habit Tracker Workspace | Approval pill + Linear Mirror badge + 11-stage rail (`03-workspace-habit-tracker.png`) |
| 3 | Open Task TASK-0021 | Context Pack renders Allowed/Forbidden/Non-claims + packet ref; proof recorded, review loop all ✓ (`05-task-detail-context-pack.png`) |
| 4 | Go to Gates | Habit Tracker gate `launch_allowed=true`, Approve enabled; SIMULATED warning (`07-gates-before.png`) |
| 5 | Approve (local-only) | "Approved (local-only · simulated)" + "event appended: gate.approved (SIMULATED)" (`10-gate-approved.png`) |
| 6 | Return to Command Center | Habit Tracker = "None"; needs-owner approvals = **0**; dropped from attention list (`11-command-center-after.png`) |

**Journey result: PASS** ✅

---

## Persistence test

| Test | Procedure | Result |
|---|---|---|
| Overlay written to disk | After approve, inspect `runs/cockpit-overlay.json` | `decision:"approved"`, `simulated:true` ✅ |
| Survives refresh | Reload Command Center | Habit Tracker still "None" ✅ |
| Survives restart | Read back from overlay on a fresh process | Decision persists; attention stays "None" ✅ |

**Persistence result: PASS** ✅

---

## Final truth statement

**What is proven (local).** The cockpit renders the WEAVE Domain (Node, Workspaces, Agents, Tasks, Proofs, Gates, Events) from local files across 9 screens; the owner can walk the full journey and take a local Gate decision; the decision persists to a local overlay and survives refresh + restart; the new **Node** and **Context Pack** primitives render from real fixture/composed data.

**What is fixture-backed / local-only.** The demo Domain is the committed fixture at `cockpit/fixtures/weave-home/` (one local Node). Live mode (`WEAVE_HOME` → a real `runs/cos-weave-home`) is supported in code but not exercised this sprint.

**What is simulated.** Every external-surface action (deploy, Linear/Slack/GitHub write) is recorded as a local owner decision + a `SIMULATED` Event. Nothing external is executed; no outbound network calls; no secrets read or shown.

**What is NOT production / externally verified.** No production deploy/hosting; no real provider (Cloudflare/Vercel) validation; no real Mirror write; not load/auth tested. WEAVE 0.2 is a draft, not final. The dependency-audit risk boundary above (2 high + 3 moderate, 0 critical, all production-deployment-class or exposed-dev-server-class) is explicitly accepted on the basis that this tool is never deployed — see "Dependency audit — risk boundary".

**What must happen next.** Owner to confirm the three new-primitive semantics flagged in ATM-384 §9 (**Node**, **Domain**, **Context Pack**). If confirmed differently, the Node model and Context Pack composition are localized changes (`lib/types.ts`, `lib/weaveHome.ts`, the two components + fixtures) and re-QA is fast. Separately, a future sprint should scope a `next` 14→16 and `vitest` 3→4 migration to close the remaining accepted dependency risk before any deployment is considered.

---

## Known limitations / follow-up

- Fixture-only this sprint; live `WEAVE_HOME` mode not exercised (acceptable per ATM-386 spec).
- Notes App has no recorded proof (correct — it is the "stale / no proof" Workspace); its Task detail shows the missing-proof state.
- New-primitive semantics (Node/Domain/Context Pack) built to working assumptions pending owner confirmation (ATM-384 §9).
- No ESLint config exists; `npm run lint` was removed and replaced with `npm run typecheck` (`tsc --noEmit`) as the truthful static-analysis gate — see QA matrix #8. A real ESLint setup (e.g. `eslint-config-next`) is a reasonable follow-up but was treated as a separate, larger change from this blocker fix.
- Dependency audit: 0 critical, 2 high + 3 moderate remain, explicitly accepted as local-only risk pending a future `next`/`vitest` major-version migration — see "Dependency audit — risk boundary" above.

---

*Report generated 2026-06-30 by Claude on branch `atm-383-owner-cockpit`. Screenshots captured headlessly (Chromium) against the local `next dev` server. This revision re-verified 2026-06-30 against `next@14.2.35` / `vitest@3.2.6` after fixing the lint-gate and dependency-audit blockers raised on ATM-383; all command outputs were re-run at fix commit `72991a9`, not carried over. Final HEAD `2795f45387e84e0b843690050d8b18387b8de7d4` is a report-only stamp (no code changes) that binds this document to its own commit hash — all QA evidence is at the fix commit above.*

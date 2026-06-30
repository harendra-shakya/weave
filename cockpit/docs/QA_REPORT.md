# ATM-387 QA Report — WEAVE 0.2 Local Owner Cockpit (canonical model)

**Date:** 2026-06-30
**Branch:** `atm-383-owner-cockpit`
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
| 7 | **Regression / smoke** | `tsc --noEmit` clean; Vitest 36/36; public-safe scan + secrets scan clean | **PASS** |

No FAIL or BLOCKED areas.

---

## Command outputs

**Typecheck** — `npx tsc --noEmit`: clean (no output).

**Unit tests** — `npx vitest run`:
```
Test Files  5 passed (5)
Tests       36 passed (36)

lib/attention.test.ts    13 ✓  (6-state derivation rules)
lib/actions.test.ts       3 ✓  (approve/hold/reject unknown)
lib/overlay.test.ts       5 ✓  (read/write/merge, agent note)
lib/weaveHome.test.ts     9 ✓  (Domain parsing + attention recovery + Node + Context Pack)
components/ui.test.tsx     6 ✓  (AttentionPill, StageRail, MirrorBadge, NonClaims)
```

**Repo gates:**
```
public_safe_repo_scan.py : ok   (no loopback-host or legacy-surface strings committed)
check_no_secrets.py      : ok   (no API keys / tokens / private keys committed)
git diff --check         : ok   (no whitespace errors)
```

**Core WEAVE Python suite** (`python -m unittest discover -s tests`): 2 failures + 2 errors —
`test_cos_weave_bootstrap_contract` and `test_validate_docs_current`. These are
**pre-existing on this branch and unrelated to the cockpit work**: verified by
running the same modules against the session-start commit `6598bde` (identical 2
failures + 2 errors), and neither test references `cockpit/`. The cockpit is an
isolated Node sub-project; this migration touched only `cockpit/**` and Linear
deliverables, not the core Python skeleton these tests cover. Flagged for the
owner as a separate, out-of-scope item.

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

**What is NOT production / externally verified.** No production deploy/hosting; no real provider (Cloudflare/Vercel) validation; no real Mirror write; not load/auth tested. WEAVE 0.2 is a draft, not final.

**What must happen next.** Owner to confirm the three new-primitive semantics flagged in ATM-384 §9 (**Node**, **Domain**, **Context Pack**). If confirmed differently, the Node model and Context Pack composition are localized changes (`lib/types.ts`, `lib/weaveHome.ts`, the two components + fixtures) and re-QA is fast.

---

## Known limitations / follow-up

- Fixture-only this sprint; live `WEAVE_HOME` mode not exercised (acceptable per ATM-386 spec).
- Notes App has no recorded proof (correct — it is the "stale / no proof" Workspace); its Task detail shows the missing-proof state.
- New-primitive semantics (Node/Domain/Context Pack) built to working assumptions pending owner confirmation (ATM-384 §9).

---

*Report generated 2026-06-30 by Claude on branch `atm-383-owner-cockpit`. Screenshots captured headlessly (Chromium) against the local `next dev` server.*

# ATM-386 QA Report — WEAVE 0.2 Local Owner Cockpit

**Date:** 2026-06-29  
**Branch:** `atm-383-owner-cockpit`  
**Tester:** Claude (AI assistant, interactive preview + accessibility-tree verification)

---

## Prerequisite check

| Item | Value |
|---|---|
| Repo path | `P:\Development\Projects\weave\cockpit\` |
| Branch | `atm-383-owner-cockpit` |
| Package manager | npm (Node 20.x) |
| Run command | `cd cockpit && npm install && npm run dev` |
| Data source | Fixture JSON at `cockpit/fixtures/weave-home/` (4 rooms) |
| What is real | Local file reads, overlay writes to `runs/cockpit-overlay.json` |
| What is simulated | All external effects (deploy, Linear write, Slack send) — logged as `simulated:true` |
| Missing access | Real Cloudflare/Vercel provider validation (intentionally out of scope) |

---

## Unit test results

```
Test Files  5 passed (5)
Tests       34 passed (34)
Start at    17:53:18
Duration    1.98s

lib/attention.test.ts    13 ✓  (6-state derivation rules)
lib/overlay.test.ts       5 ✓  (read/write/merge)
lib/weaveHome.test.ts     7 ✓  (fixture parsing + attention recovery)
lib/actions.test.ts       3 ✓  (approve/hold/reject unknown)
components/ui.test.tsx    6 ✓  (AttentionPill, StageRail, MirrorBadge, NonClaims)
```

---

## CI scanner results

```
public-safe repo scan: ok      (no localhost/127.0.0.1/legacy-surface strings committed)
check_no_secrets.py: ok        (no API keys / tokens / private keys committed)
```

---

## Screen verification (all 9 screens via interactive preview)

### 1. Command Center `/`
- KPI strip: 4 Active Rooms, 4 Open Missions, **1 Needs-owner approvals**, 1 Blocked, 1 Ready for review
- Attention list severity-sorted: Blocked (Receipts) → Approval required (Habit Tracker) → Ready for review (Calculator) → Stale (Notes App)
- Active Rooms grid: all 4 rooms with stage + attention state
- Runtime checkpoints: Codex (healthy), Claude (healthy), Local runtime (idle)
- Boundary banner: "Local-only cockpit · fixture data · no secrets · external actions simulated" ✅

### 2. Room Detail `/rooms/[id]` — Habit Tracker
- Heading + attention pill: "Approval required" ✅
- Linear Mirror badge: "Linear · Mirror — not source of truth" ✅
- Lifecycle stage rail: all 11 stages rendered ✅
- Active Mission link with Claude runtime + proof state ✅
- Proof & evidence claim + surface + non-claims ✅
- No blockers shown (correct — this room's attention is approval, not blocked) ✅

### 3. Mission Board `/missions`
- 4 columns: Open, In progress, Ready for review, Done for scope ✅
- All 4 missions visible with runtime, due date, app context ✅

### 4. Mission Detail `/missions/TASK-0021`
- Title, TASK ID, Room link, stage ✅
- Allowed list / Forbidden list ✅
- Runtime (Claude icon + label), Due date, Proof status: recorded ✅
- Review loop: Observe ✓ Validate ✓ Govern ✓ Review ✓ Sync ✓ ✅
- Non-claims list ✅

### 5. Proof / Evidence Ledger `/proof`
- All 3 proof envelopes (Receipts, Habit Tracker, Calculator) ✅
- Claims, proof surface (TOOL_VERIFIED_LOCAL), state (recorded) ✅
- Review loop per envelope ✅
- Non-claims per envelope ✅
- Event log showing SIMULATED gate.approved event ✅

### 6. Gate / Approval Queue `/gates`
- 2 gates: Deploy Receipts App (HIGH blast radius) + Connect Linear write (MEDIUM) ✅
- Hard gate warning on Receipts: "Not owner-approvable until provider access is validated" ✅
- SIMULATED warning on both: "⚠ External effect is SIMULATED" ✅
- Approve (local-only) + Hold buttons ✅

### 7. Runtime / Agent Panel `/runtime`
- Codex: healthy, current task, needs-owner input question, status history, note composer ✅
- Claude: healthy, current task, status history, note composer ✅
- Local runtime: idle, note composer ✅
- All note composers: "Stored locally · not sent externally" ✅

### 8. Settings / Data Source `/settings`
- Fixture data selected (vs Live local WEAVE home toggle) ✅
- Resolved path: `<cockpit>/fixtures/weave-home` ✅
- Proof boundary bullet list (5 items) ✅
- Mirrors/Couriers: Linear (Mirror, disconnected), Slack (Courier, disconnected), GitHub (Mirror, disconnected) ✅
- About: "WEAVE 0.2 — draft, not final" ✅

### 9. Rooms List `/rooms`
- Accessible via nav + verified through room links ✅

---

## Owner journey — end-to-end

**Journey:** Command Center → Room (Habit Tracker) → Mission (TASK-0021) → Gates → Approve

| Step | Action | Result |
|---|---|---|
| 1 | Land on Command Center | Habit Tracker shows "Approval required", needs-owner counter = 1 |
| 2 | Click Habit Tracker room | Room detail shows approval badge, Linear Mirror, lifecycle rail |
| 3 | Click mission link | Mission detail shows TASK-0021 with proof recorded, review loop all ✓ |
| 4 | Navigate to Gates | Two gates; Habit Tracker gate shows launch_allowed=true, Approve button enabled |
| 5 | Click "Approve (local-only)" | Shows "Approved (local-only · simulated)" + "event appended: gate.approved (SIMULATED)" |
| 6 | Return to Command Center | **Habit Tracker now "None"**, needs-owner counter = **0**, dropped from attention list |

**Journey result: PASS** ✅

---

## Persistence test

| Test | Procedure | Result |
|---|---|---|
| Overlay written to disk | After approve, read `cockpit/runs/cockpit-overlay.json` | File present; `decision: "approved"`, `simulated: true` ✅ |
| State survives refresh | Reload Command Center in same session | Habit Tracker still "None" ✅ |
| State survives restart | Stop server, start fresh, load Command Center | Habit Tracker still "None", needs-owner = 0 ✅ |

**Persistence result: PASS** ✅

---

## Boundary labels verification

| Boundary | Where shown | Verified |
|---|---|---|
| Fixture vs real local data | Settings → "Fixture data · selected" + resolved path | ✅ |
| Local proof vs production proof | Settings → proof boundary bullets + "Not production · not externally verified" | ✅ |
| Mirror/Courier vs source-of-truth | Every mirror badge + Settings mirrors section | ✅ |
| Simulated approval vs actual action | Gate page warning + action result confirmation text | ✅ |
| Local-only boundary banner | Every page header | ✅ |

---

## What is proven

- Local UI renders WEAVE fixture state accurately across 9 screens
- Owner can navigate the full journey: Command Center → Room → Mission → Proof/Gate → required action
- Gate approval persists to a local overlay file, survives refresh and restart
- All external effects (deploy, Linear write) are recorded as SIMULATED, never executed
- No secrets read or shown anywhere

## What is NOT proven (by design)

- Does not prove Cloudflare/Vercel deployment (hard gate, blocked by missing provider access)
- Does not perform real Linear write (mirror only, approval is local simulation)
- Does not prove production-grade load, auth, or real Slack/GitHub mutation
- Not externally verified — local dev tool only

## Known limitations / follow-up (ATM-387)

- Brave browser shields block content rendering on localhost in the current computer-use setup; Chrome extension (gif_creator) was not connected so a GIF recording could not be produced
- Rooms List page (`/rooms`) is accessible via nav but no explicit table test; covered implicitly by room navigation
- Notes App `/rooms/notes-app` has no active mission (correct — stale room); detail page would show EmptyState for missions
- Live WEAVE home mode (`WEAVE_HOME` env var) not tested this sprint; fixture-only acceptable per ATM-386 spec

---

*Report generated: 2026-06-29 by Claude on branch `atm-383-owner-cockpit`*

# ATM-383 — WEAVE 0.2 Local Owner Cockpit Sprint (Plan)

> **Vocabulary note (superseded terminology).** This planning doc was written with
> the earlier Home/Castle · Room · Mission · Runtime · Courier terms. Per George's
> 2026-06-30 update, the **canonical WEAVE 0.2 model is now primary**: Domain · Node ·
> Workspace · Agent · Task · Event · Proof · Gate · Mirror · Context Pack. Read the
> legacy terms below as their canonical equivalents (Room→Workspace, Mission→Task,
> Runtime→Agent, Home→Domain, Courier→Mirror). The brief, design, build, and QA
> deliverables all use the canonical model.

## Context

Harendra is assigned **[ATM-383](https://linear.app/atumera-llc/issue/ATM-383/weave-02-local-owner-cockpit-sprint-formal-product-process-ui-mvp)**: a one-week sprint (Mon 2026-06-29 → Fri 2026-07-03) to deliver a **local owner cockpit UI** for WEAVE, run through a **formal product process**, not as a "just make wireframes" task.

WEAVE today (`v0.1.0`) is a pure-Python, zero-dependency, local-file "Chief of Staff" skeleton. It records app lifecycle state as JSON/markdown under a gitignored `runs/cos-weave-home/`. There is **no UI** — the "cockpit" is currently just the text `WEAVE | Home=… | App=… | Stage=… | State=… | Next=…` state line. George wants WEAVE 0.2 to gain a *local* owner cockpit that makes that state **understandable and inspectable** for the owner (George), and acts as a second channel for talking to the agent — while staying strictly local, with no real external writes.

The work is broken into four child issues with a fixed order: brief → wireframes/design → build → QA. The intended outcome is a runnable local cockpit demonstrating one full owner journey (Command Center → Room → Mission → Proof/Gate → required action), with QA evidence linked back to Linear and an explicit local-only / non-production proof boundary.

This plan covers: the product process, the mapping from WEAVE primitives to the real data in this repo, the cockpit architecture, the security guardrails, and per-day/per-issue deliverables.

---

## Hard guardrails (do NOT cross without separate George approval)

From ATM-383 non-goals + the repo's own contracts:
- No production deploy / hosting / public launch.
- No real Slack / Linear / GitHub write automation. (Linear/Slack/GitHub are **Mirrors/Couriers**, never canonical state — label them that way in the UI.)
- No domain / DNS / OAuth / Supabase / Vercel / env mutation.
- No billing / payment / wallet / token movement.
- No secret access or credential handling. No outbound network calls at all.
- No public emails / posts / outreach. No inter-Castle federation.
- Do not claim WEAVE 0.2 is final.
- **Gated/external actions in the cockpit are simulated/logged only**, never executed.

### Repo CI scanners that will block the build (design around these now)
Two scripts run in CI (`.github/workflows/public-safe-ci.yml`) and scan every tracked `.py/.js/.ts/.tsx/.html/.css/.json/.md/...` file:
- `scripts/public_safe_repo_scan.py` flags loopback host strings (the `loopback-host` label) and a set of legacy-surface product/runtime names (the `legacy-surface` label) — see the `PATTERNS` list in that script for the exact terms — plus private paths/IPs/keys. **Note: this very doc must avoid spelling those terms or it fails its own scanner.**
- `scripts/check_no_secrets.py` flags API keys, tokens, private keys, wallet addresses.

Consequences for the cockpit:
- **Runtime fixtures must not use the legacy runtime name ATM-383 lists as an example.** Use `Codex`, `Claude`, and `Local runtime` as the runtime/worker identities — we substitute scanner-safe names.
- Do **not** commit loopback host strings (the ones the scanner flags) in source or README. The dev server printing its loopback URL at runtime is fine (not a committed string). If a committed file genuinely needs a loopback reference, add a **scoped allowlist entry** in `scripts/public_safe_repo_scan.py` (it supports `ALLOWLIST_LINE_PATTERNS` keyed by path+label+regex) rather than obfuscating.
- Gitignore `cockpit/node_modules/` and `cockpit/.next/` so dependencies/build output are never committed or scanned.
- All generated/owner-action state writes go under gitignored `runs/` so they are never committed or scanned.

---

## Tech decision (rationale)

**Next.js (App Router) + React/TypeScript, run locally with `next dev` only. Isolated as its own sub-project under `cockpit/` with its own `package.json`. Core WEAVE stays pure Python.**

- Chosen for builder fluency: in a 5-day solo sprint the biggest risk is the build slipping, and an unfamiliar stack is the main cause. Harendra is most productive in Next.js.
- Next.js **route handlers (`app/api/...`) are the local read/write backend** — reading the WEAVE home JSON and persisting owner actions to the local filesystem needs no separate server.
- React components directly satisfy ATM-385's "component/status system" deliverable.
- Security discipline (non-negotiable): strictly `next dev` local; **no `next build`/deploy this sprint** (that would hit the production-deploy gate); no external network fetches; no secrets/env mutation; gitignore `node_modules`/`.next`; keep the Node toolchain quarantined in `cockpit/` so core WEAVE remains zero-dependency.
- Accepted cost: adds a Node/npm supply chain to a deliberately dependency-free repo. Mitigated by isolation + gitignore. Flag to George Monday for an easy sign-off.

Layout (new top-level folder, committed; `node_modules`/`.next` gitignored): `cockpit/`
```
cockpit/
  package.json
  next.config.js
  app/
    layout.tsx
    page.tsx                 # Command Center / Home
    rooms/[id]/page.tsx      # Room detail; rooms/page.tsx = list
    missions/[id]/page.tsx   # Mission detail; missions/page.tsx = board
    proof/page.tsx           # Proof / Evidence Ledger
    gates/page.tsx           # Gate / Approval Queue (owner action lives here)
    runtime/page.tsx         # Runtime / Agent communication panel
    settings/page.tsx        # Data source status + local-only boundary
    api/
      home/route.ts          # GET WEAVE home state (resolves fixture vs live)
      actions/route.ts       # POST owner action -> writes overlay + events.jsonl
  lib/
    weaveHome.ts             # read/parse WEAVE home JSON (same schemas as repo)
    attention.ts             # derive Owner Attention state from blockers/review/proof
    overlay.ts               # read/write local owner-action overlay
  components/                # cards, status pills, attention badges, stage rail, tables
  styles/tokens.css          # design tokens + Owner Attention status palette
  fixtures/weave-home/       # expanded, multi-app demo dataset (committed, labeled FIXTURE)
  docs/
    SPRINT_PLAN.md           # this document
    PRODUCT_INGREDIENTS_BRIEF.md
    WIREFRAMES.md            # + exported wireframe images in cockpit/docs/assets/
    DESIGN_SYSTEM.md
    QA_REPORT.md
  README.md                  # run command (`npm install` + `npm run dev`) + local-only boundary
```
- Data source resolution: `WEAVE_HOME` env var → default `cockpit/fixtures/weave-home/` so it runs out-of-the-box with no bootstrap. Live mode points at a real `runs/cos-weave-home/`.
- Owner actions write to an **overlay** file under gitignored `runs/` (e.g. `runs/cockpit-overlay.json`) so the read-only WEAVE fixtures stay pristine and state survives restart.

---

## Engineering discipline & workflow

**TDD (red → green → refactor) for all logic.** Write the failing test first, then the implementation.
- Test runner: **Vitest + React Testing Library** (dev-only deps inside `cockpit/`, gitignored `node_modules`).
- Highest-value TDD targets are the pure functions in `lib/`: `attention.ts` (Owner Attention derivation rules), `weaveHome.ts` (schema parsing of `app.json`/`lifecycle.json`/`proof-tray.json`/`deployment-gates.json`), `overlay.ts` (read/write + merge of owner-action overlay), and the `app/api/actions` route handler (gate approval persists + logs `SIMULATED`, never executes external effects). Each gets a failing test → implementation → refactor.
- Components get behavior tests (renders correct attention pill for a given state; approve button posts and reflects new state).

**Claude verifies by actually interacting with the running app — not just unit tests.** After the build, drive the live `next dev` instance through the browser (Claude Preview / Claude-in-Chrome MCP): navigate the full owner journey, click the local-only Approve, refresh + restart, and **screenshot each step**. These screenshots are the ATM-387 QA evidence. A feature is not "done" until it has been observed working in the real UI.

**Version control policy.**
- Work on a **feature branch** `atm-383-owner-cockpit` (do not commit straight to `main`).
- **Commit locally and often** — at each green TDD step and each completed deliverable (Step 0 plan, brief, wireframes, design, each working view, QA). Small, descriptive commits.
- **Never `git push` without explicit permission.** Local commits only until George/Harendra approves a push. Commit messages end with the `Co-Authored-By: Claude …` trailer.

---

## Primitive → repo-data → screen mapping (the heart of the brief)

WEAVE 0.2 vocabulary maps onto data that already exists in this repo (verified in `scripts/weave_cos_skeleton.py` and `docs/samples/cos-weave-skeleton/`):

| WEAVE 0.2 primitive | Real repo data | Cockpit screen |
|---|---|---|
| Home / Castle | `runs/cos-weave-home/state.json`, `owner-profile.json`, `updates/readback.json` | Command Center |
| Room / App Workspace | `apps/<id>/app.json`, `apps/registry.json`, `lifecycle.json` (11 stages) | Room List / Room Detail |
| Mission / bounded work packet | `tasks.json` + `worker-packets/WP-*.md` (objective, scope, forbidden actions, review loop) | Mission Board / Mission Detail |
| Runtime / worker | `worker_orchestration` + task assignment (label as Codex / Claude / Local runtime — **not the blocked legacy runtime term**) | Runtime/Agent panel |
| Proof Envelope | `proof/proof-tray.json` (`claim`, `proof_surface`, `artifact_refs`, `review_loop_state`, `non_claims`) | Proof / Evidence Ledger |
| Gate / Approval Queue | `deployment-gates.json` (providers, capabilities, `forbidden_until_validated`) + eval hard gates in `packages/weave-tool/evals/lifecycle/*.yaml` | Gate / Approval Queue |
| Event Log / Proof Ledger | `updates/readback.json` history + an append-only `updates/events.jsonl` we maintain for owner actions | Proof Ledger / activity |
| Mirror / Courier | `tracker` field (`mode: local`, `linear_required: false`) | labeled banner on relevant screens |
| Owner Attention state | derived from `blockers/blocker-tray.json` + `review/review-queue.json` + stage `proof_state` | status pills everywhere |
| Treaty / Embassy | not in 0.1 data — mark as **future / out-of-scope** in the brief | (not built) |

**Owner Attention states** (the cockpit's core status vocabulary) derived as: `none`, `needs owner`, `blocked`, `approval required`, `ready for review`, `stale/no-proof`. Map each to a concrete rule over the data (e.g. `blocker.state == "blocked_until_validated"` → blocked; `review item decision == not_accepted` + proof recorded → ready for review; `proof_state == "missing"` past a stage entry → stale/no-proof).

**Lifecycle stages (11)** to render as a Room's progress: intent → research → selection → plan → engineering → qa → deployment → kpi-setup → marketing → iteration → analysis, each with `state` (active/complete/blocked_by_prior_gates/not_started) and `proof_state`.

**Review loop** (shown on Mission/Proof): `observe → validate → govern → review → sync`.

---

## Screen inventory (7 areas required by ATM-383)

1. **Command Center / Home** — active Rooms, open Missions, needs-owner approvals, blocked / ready-for-review items, latest runtime checkpoints. Read from `state.json` + `registry.json` + aggregated trays.
2. **Room List + Room Detail** — status, lifecycle stage rail, active Missions, proof/evidence summary, blockers, linked artifacts.
3. **Mission Board + Mission Detail** — objective, scope, allowed/forbidden actions, runtime/assignee, due date, evidence required, proof status, owner attention state.
4. **Proof / Evidence Ledger** — claims, target surface, evidence refs, commands/actions, proof boundary, non-claims.
5. **Gate / Approval Queue** — gated action, risk/blast radius, required approval/proof, current decision/status. **The "required action" the owner can take lives here** (approve/hold — local-only, external effect simulated).
6. **Runtime / Agent Communication Panel** — runtime identity, health/checkpoint, blocker/input request, latest status. Second comms channel = owner can post a note / acknowledge a request → written locally, no real send.
7. **Settings / Data Source Status** — fixture vs live home, local-only proof boundary banner, "no secrets shown" statement, which runtime names are placeholders.

---

## Per-issue / per-day deliverables

### Step 0 (before building) — commit this plan into the repo
Create `cockpit/docs/` and save this sprint plan as `cockpit/docs/SPRINT_PLAN.md` so the process, guardrails, and primitive mapping are a tracked artifact alongside the brief/wireframes/design/QA docs. This is the source the other `cockpit/docs/*` deliverables build on.

### Mon 2026-06-29 — [ATM-384](https://linear.app/atumera-llc/issue/ATM-384): Product Ingredients Brief + user stories
Write `cockpit/docs/PRODUCT_INGREDIENTS_BRIEF.md` containing:
- **Glossary** (each WEAVE 0.2 primitive, defined against the real repo data above; mark Treaty/Embassy as future).
- **User stories / JTBD** for George (e.g. "As the owner, I want to see everything that needs my approval in one place so I don't have to read JSON").
- **Domain object + state model** (the mapping table above + the Owner Attention state rules + lifecycle/review-loop enums).
- **Screen inventory + information architecture** (the 7 areas + nav/route map).
- **Workflow map** for the demo journey (Command Center → Room → Mission → Proof/Gate → approve).
- **Assumptions + open questions** (e.g. confirm the runtime-name substitution; confirm whether live `runs/` mode is in scope this week).
- Link the brief back to ATM-384.

### Tue 2026-06-30 — [ATM-385](https://linear.app/atumera-llc/issue/ATM-385): screen map + wireframes (part 1)
- Route/screen map (routes for the 7 views).
- Low-fidelity wireframes for all 7 screens (saved to `cockpit/docs/assets/` and `WIREFRAMES.md`). Attach to ATM-385.

### Wed 2026-07-01 — [ATM-385](https://linear.app/atumera-llc/issue/ATM-385): visual design + component/status system (part 2)
- `cockpit/docs/DESIGN_SYSTEM.md` + `cockpit/styles/tokens.css`: color/type/spacing tokens, the **Owner Attention status palette** (6 states → color + label), component specs (card, pill, badge, stage rail, table, panel).
- Hi-fi mockups of Command Center + one detail screen. Attach to ATM-385.

### Thu 2026-07-02 — [ATM-386](https://linear.app/atumera-llc/issue/ATM-386): functional local UI (TDD)
- Set up Vitest + RTL. Build `lib/` and route handlers **test-first** (failing test → impl → refactor → local commit): `lib/weaveHome.ts` reader (same JSON schemas as the repo), `lib/attention.ts` (Owner Attention derivation), `lib/overlay.ts`, `app/api/home` + `app/api/actions` route handlers (the latter writes the overlay + `events.jsonl`, external effect `SIMULATED` only).
- `cockpit/fixtures/weave-home/`: expand the single-app sample into a **multi-app, multi-mission, multi-attention-state** demo dataset (≥3 Rooms incl. one blocked, one approval-required, one ready-for-review; runtimes named Codex/Claude/Local runtime).
- Build all 7 views (`app/...page.tsx`) with the component/status system.
- Implement the owner journey end-to-end incl. a **local-only Gate approval** that persists (overlay) and is reflected after refresh/restart; external effect logged to `events.jsonl` as `SIMULATED`.
- `cockpit/README.md` with the documented run command (`npm install` then `npm run dev`). Link build to ATM-386.

### Fri 2026-07-03 — [ATM-387](https://linear.app/atumera-llc/issue/ATM-387): QA + proof handoff
- Run the Vitest suite (all green) **and** drive the live app through the browser (Claude Preview / Claude-in-Chrome MCP): walk the full owner journey, click local-only Approve, refresh + restart, screenshot each step.
- `cockpit/docs/QA_REPORT.md`: unit-test results + happy-path + failure-path checks; the interaction screenshots/recording of the full owner journey; **persist-across-restart** demonstrated (or limitation documented); confirmation that gated/external actions are simulated only.
- Proof-boundary statement: **what is proven** (local UI renders WEAVE state, owner can take local actions that persist), **what is fixture-backed**, **what is local-only**, **what is NOT production/external-write verified**.
- Run repo gates: `python3 scripts/check_no_secrets.py`, `python3 scripts/public_safe_repo_scan.py`, `python3 -m unittest discover -s tests -p 'test_*.py'`, `git diff --check`. All green.
- Attach QA packet + screenshots/recording to ATM-387; update ATM-383 with the summary.

---

## Reuse (don't reinvent)
- Read state shapes from the working engine `scripts/weave_cos_skeleton.py` and the committed sample `docs/samples/cos-weave-skeleton/` — the cockpit consumes the **same JSON schemas** (`weave-cos-app/v0.1`, `weave-cos-lifecycle/v0.1`, `weave-cos-proof-tray/v0.1`, `weave-deployment-gates/v0.1`, etc.); do not invent a parallel model.
- Use exact contract vocabulary for labels (stage names, `ACCEPT_FOR_SCOPE`/`REVISE`/`BLOCKED`/`NEEDS_OWNER_ACTION`, review-loop steps) so the UI is faithful to the system — except runtime names, which use scanner-safe substitutes.
- Generate the expanded fixture by running `bin/weave cos-bootstrap` for multiple intents, then hand-editing states — rather than authoring JSON from scratch.

## Verification (end-to-end)
1. `cd cockpit && npm install && npm test` → Vitest suite green (lib + route handlers + components).
2. `npm run dev` → Claude drives the app via browser MCP (fixture home is the default).
3. Walk the journey: Command Center shows an "approval required" item → open its Room → open the Mission → view the Proof/Gate → click **Approve (local-only)** → confirmation shows, `events.jsonl` records a `SIMULATED` external effect. Screenshot each step.
4. Refresh and restart the dev server → the approval state persists (overlay file).
5. Confirm Settings screen shows fixture-vs-live + local-only boundary; confirm no runtime uses the blocked legacy runtime term.
6. Run the repo CI gates (`check_no_secrets.py`, `public_safe_repo_scan.py`, `unittest` discover, `git diff --check`); all pass.

## Open questions to confirm with George (raise Monday in ATM-384)
- OK to add an **isolated Node/Next.js toolchain** under `cockpit/` (core WEAVE stays zero-dependency Python; `node_modules`/`.next` gitignored)?
- OK to substitute `Codex/Claude/Local runtime` for the example runtime name ATM-383 lists in committed fixtures (required to pass `public_safe_repo_scan.py`)?
- Is pointing the cockpit at a real `runs/cos-weave-home/` ("live mode") in scope this week, or fixture-only acceptable for the MVP?
- Is committing the cockpit under a new top-level `cockpit/` folder (vs `packages/`) acceptable for repo layout?

# WEAVE 0.2 — Product Ingredients Brief (Local Owner Cockpit)

> Deliverable for **[ATM-384](https://linear.app/atumera-llc/issue/ATM-384/weave-02-product-ingredients-user-stories-for-local-owner-cockpit)**.
> Status: **v1 draft** (sprint Mon 2026-06-29). Prerequisite for wireframes (ATM-385) and build (ATM-386).
> This brief converts WEAVE 0.2 draft context into concrete UI ingredients **grounded in data that already exists in this repo** — it does not invent a new model. Every primitive below is mapped to a real schema and file verified in `scripts/weave_cos_skeleton.py` and the committed sample `docs/samples/cos-weave-skeleton/`.

---

## 0. Purpose & one-paragraph product thesis

WEAVE today is a local-file "Chief of Staff" skeleton: an agent thread maintains a folder of JSON/markdown that records an owner's apps, their lifecycle stage, proof, blockers, gates, and review state. The only "cockpit" today is a single text state line. **The WEAVE 0.2 local owner cockpit is a read-and-act UI over that same folder** so the owner (George) can *see* the company state at a glance, *inspect* any claim down to its evidence, and *take the few decisions that are genuinely his* — without reading raw JSON. It is strictly local, makes no real external writes, and never overstates what is proven.

**The cockpit's job statement:** *"Show me what needs me, let me inspect why, let me act locally and safely, and never lie to me about what is real."*

---

## 1. Glossary (WEAVE 0.2 primitive → real repo data)

Each primitive is defined twice: the **concept** (how to talk about it to George) and the **substrate** (the actual file/schema the cockpit reads).

| Primitive | Concept (owner-facing) | Substrate (file · schema) |
|---|---|---|
| **Home / Castle** | The owner's sovereign company graph — the root that owns all apps. | `state.json`, `owner-profile.json`, `updates/readback.json`, `updates/events.jsonl` · `weave-cos-skeleton/v0.1` |
| **Room / App Workspace** | One app/product the owner is building; its own workspace with lifecycle and proof. | `apps/registry.json` + `apps/<id>/app.json` + `apps/<id>/lifecycle.json` · `weave-cos-app/v0.1`, `weave-cos-lifecycle/v0.1` |
| **Mission / bounded work packet** | A bounded unit of work given to a runtime, with explicit objective, allowed/forbidden actions. | `apps/<id>/tasks.json` (`weave-cos-task-ledger/v0.1`) + `worker-packets/WP-*.md` |
| **Runtime / worker** | The agent identity executing a Mission (Codex / Claude / Local runtime). | `app.json#worker_orchestration` + task assignment. *(Fixture names avoid the legacy runtime term the repo scanner blocks — see §8.)* |
| **Proof Envelope** | A claim plus its evidence, target surface, and explicit non-claims — the unit that advances state. | `apps/<id>/proof/proof-tray.json` items · `weave-proof-envelope/v0.1` |
| **Gate / Approval Queue** | A risky transition that is blocked until a required approval/proof exists. | `apps/<id>/deployment-gates.json` (`weave-deployment-gates/v0.1`) + eval hard gates in `packages/weave-tool/evals/lifecycle/*.yaml` |
| **Event Log / Proof Ledger** | The append-only history of what happened and what was proven. | `updates/events.jsonl` · `weave-cos-event/v0.1` (+ proof tray as the evidence ledger) |
| **Mirror / Courier** | External tools (Linear/Slack/GitHub) that *reflect* or *carry* state but are **never the source of truth**. | `app.json#tracker` (`mode: "local"`, `linear_required: false`) |
| **Owner Attention state** | The single status that tells the owner whether a thing needs them — the cockpit's core vocabulary. | *Derived* (see §3) from blockers + review queue + stage `proof_state` + gates |
| **Treaty / Embassy** | Future inter-Castle cooperation between separate owners' graphs. | **Not present in 0.1 data — out of scope this sprint; shown as a "future" placeholder only.** |
| **Review loop** | The mandatory `observe → validate → govern → review → sync` sequence before any claim is accepted. | `review_loop` arrays everywhere; `proof-tray#review_loop_state`; `review/review-queue.json` |
| **Stage-entry contract** | The eval+procedure+primitive+skills bundle that must be loaded before a stage acts. | `state.json#stage_entry_contracts[]` · `weave-stage-entry-contract/v0.1` |
| **Non-claim** | An explicit statement of what is **not** proven — shown next to every claim. | `non_claims[]` on app, lifecycle, proof, deployment-gates |

---

## 2. User stories / Jobs-To-Be-Done (owner = George)

Prioritized; each maps to a screen (§5) and an acceptance check.

**Epic A — Situational awareness ("what needs me?")**
- **A1.** As the owner, I want one screen showing everything that needs my attention (approvals, blocked, ready-for-review), so I don't have to open each app. → *Command Center*
- **A2.** As the owner, I want to see all my Rooms and each Room's current lifecycle stage and status at a glance. → *Room List*
- **A3.** As the owner, I want to see the latest runtime checkpoints so I know my agents are alive and where they are. → *Command Center / Runtime panel*

**Epic B — Inspection ("why is this the state?")**
- **B1.** As the owner, I want to open a Room and see its 11-stage lifecycle rail with which stage is active, complete, or blocked. → *Room Detail*
- **B2.** As the owner, I want to open a Mission and read its objective, scope, allowed/forbidden actions, runtime, and proof status. → *Mission Detail*
- **B3.** As the owner, I want to inspect a Proof Envelope: the claim, its evidence refs, the proof surface, and crucially the **non-claims**, so I never mistake local proof for deployment/live proof. → *Proof Ledger*
- **B4.** As the owner, I want to see exactly why something is blocked and what the safe next action is. → *Room Detail / Gate Queue*

**Epic C — Action ("let me decide, safely")**
- **C1.** As the owner, I want to approve or hold a gated action, with the decision persisted, while any external effect is **simulated only**. → *Gate / Approval Queue* (the sprint's required owner action)
- **C2.** As the owner, I want to acknowledge a blocker / mark an item ready-for-review and have it stick across refresh and restart. → *any screen → overlay*
- **C3.** As the owner, I want to leave a note for a runtime as a second channel of communication, written locally with no real send. → *Runtime panel*

**Epic D — Trust ("never lie to me")**
- **D1.** As the owner, I want every screen to make the proof boundary explicit: what is proven, fixture-backed, local-only, and not-verified. → *Settings + persistent boundary banner*
- **D2.** As the owner, I want Linear/Slack/GitHub clearly labeled as Mirrors/Couriers, not the source of truth. → *Mirror banner on relevant screens*

---

## 3. Domain object & state model

### 3.1 Core objects and key fields (exact, from real data)

- **Home** (`weave-cos-skeleton/v0.1`): `active_app_id`, `app_count`, `state` (`local_skeleton_ready`), `review_loop`, `stage_entry_contracts[]`, `non_claims[]`, `surface` (`codex`).
- **Room/App** (`weave-cos-app/v0.1`): `app_id`, `name`, `owner_intent`, `current_stage`, `requested_stage`, `state`, `missing_gates[]`, `tracker{mode,linear_required}`, `worker_orchestration{mode}`, `intent_truth{...}`, `deployment_gates{...}`, `non_claims[]`, `next_action`.
- **Lifecycle** (`weave-cos-lifecycle/v0.1`): `stages[]` where each stage = `{ stage, label, state, proof_state, procedure_ref, stage_entry_contract }`.
- **Mission/Task** (`weave-cos-task/v0.1` in `weave-cos-task-ledger/v0.1`): `task_id`, `stage`, `state`, `objective`, `worker_packet_ref`, `review_loop`. Packet body (`WP-*.md`) carries **Objective / Allowed / Forbidden / Non-Claims / Review Loop**.
- **Proof Envelope** (`weave-proof-envelope/v0.1`): `claim`, `proof_surface` (e.g. `TOOL_VERIFIED_LOCAL`), `artifact_refs[]`, `consulted_contract_refs[]`, `review_loop_state{observe,validate,govern,review,sync}`, `non_claims[]`, `state` (`recorded`), `task_id`.
- **Gate** (`weave-deployment-gates/v0.1`): `state` (`deployment_blocked_until_provider_access_validated`), `launch_allowed`, `local_progress_allowed`, `blocked_by_provider_access`, `providers[]{provider, proof_state, required_capabilities[]}`, `non_claims[]`.
- **Blocker** (`weave-cos-blocker-tray/v0.1`): `blockers[]{ id, state, missing[], next_action }`.
- **Review item** (`weave-cos-review-queue/v0.1`): `items[]{ id, artifact_refs[], decision, loop[], state }`.
- **Event** (`weave-cos-event/v0.1`): `{ app_id, at, event, intent, state }` (one JSON object per line in `events.jsonl`).

### 3.2 Enumerations (use these exact strings as UI labels)

- **Lifecycle stages (11, ordered):** `intent → research → selection → plan → engineering → qa → deployment → kpi-setup → marketing → iteration → analysis`.
- **Stage `state`:** `active`, `complete`, `blocked_by_prior_gates`, `not_started`.
- **Stage `proof_state`:** `missing`, `not_required_yet`, `recorded` (proven), `not_started`.
- **Blocker `state`:** `open_question`, `blocked_until_validated`.
- **Review `decision` / `state`:** `not_accepted_as_done` / `pending_owner_context` (→ accepted states: `ACCEPT_FOR_SCOPE`).
- **Gate `proof_state` (per provider):** `not_validated`, `validated`.
- **Allowed done states (completion contract):** `ACCEPT_FOR_SCOPE`, `DONE_FOR_SCOPE_ONLY`, `REVISION_REQUIRED`, `BLOCKED`, `NEEDS_OWNER_ACTION`.
- **Review-loop return values:** `ACCEPT_FOR_SCOPE`, `REVISE`, `BLOCKED`, `NEEDS_OWNER_ACTION`.

### 3.3 Owner Attention state — the derived status (cockpit's core vocabulary)

WEAVE does not store a single "attention" field; the cockpit **derives** it per Room/Mission. Six states, evaluated in **priority order** (a Room shows its highest-priority match):

| Priority | Attention state | Derivation rule (over real fields) |
|---|---|---|
| 1 | **blocked** | any blocker `state == "blocked_until_validated"`, or current stage `state == "blocked_by_prior_gates"`, or gate `blocked_by_provider_access == true` while deployment is requested |
| 2 | **approval required** | a Gate is pending owner approval (`launch_allowed == false` with `requested_stage` at/after `deployment`), or completion `allowed_done_state == "NEEDS_OWNER_ACTION"` |
| 3 | **needs owner** | a blocker `state == "open_question"` (e.g. `owner-context-needed`), or unanswered onboarding context |
| 4 | **ready for review** | a proof envelope `state == "recorded"` with a review item still `pending_owner_context` / `not_accepted_as_done` |
| 5 | **stale / no-proof** | the `current_stage` has `proof_state == "missing"` and no recent event advancing it |
| 6 | **none** | nothing pending; current proof recorded and review accepted |

This derivation lives in `lib/attention.ts` and is the **first thing built test-first** (ATM-386, TDD), because every screen depends on it.

### 3.4 State transitions the cockpit reflects (does not drive)

WEAVE's rule: **proof advances state; gates block transitions.** The cockpit visualizes this and lets the owner record *local* decisions; it never silently converts one proof kind into another. The owner action in scope (gate approve/hold) writes a **local overlay** + an event, and marks external effects `SIMULATED`.

---

## 4. Workflow map — the demo owner journey

The single end-to-end journey the MVP must demonstrate (success criterion in ATM-383):

```
Command Center
  → (owner sees a Room flagged "approval required")
Room Detail
  → (lifecycle rail shows deployment stage blocked by a Gate)
Mission Detail
  → (the Mission that requested deployment; objective + forbidden actions + proof status)
Proof / Gate
  → (inspect the Proof Envelope + the Gate's required approval, risk/blast radius, non-claims)
Required action: Approve (local-only)
  → decision persisted to overlay; event appended as SIMULATED external effect;
    attention state recovers; survives refresh + restart.
```

Secondary journeys: acknowledge an `open_question` blocker (needs owner → none); post a note to a runtime (Runtime panel); toggle fixture vs live home (Settings).

---

## 5. Screen inventory & information architecture

Seven areas (per ATM-383), with routes (Next.js App Router) and primary data sources:

| # | Screen | Route | Reads | Owner action |
|---|---|---|---|---|
| 1 | **Command Center / Home** | `/` | `state.json`, `registry.json`, aggregated trays, latest events | none (navigation hub) |
| 2 | **Room List** | `/rooms` | `registry.json` + each `app.json` | none |
| 2b | **Room Detail** | `/rooms/[id]` | `app.json`, `lifecycle.json`, proof/blocker/review trays | acknowledge blocker |
| 3 | **Mission Board** | `/missions` | all apps' `tasks.json` | none |
| 3b | **Mission Detail** | `/missions/[id]` | `tasks.json` + `WP-*.md` + linked proof | mark ready-for-review |
| 4 | **Proof / Evidence Ledger** | `/proof` | `proof-tray.json` across apps + `events.jsonl` | none |
| 5 | **Gate / Approval Queue** | `/gates` | `deployment-gates.json` + eval hard gates | **approve / hold (local-only)** |
| 6 | **Runtime / Agent panel** | `/runtime` | `worker_orchestration`, task assignment, latest checkpoints | post local note |
| 7 | **Settings / Data Source** | `/settings` | resolved home path, fixture-vs-live flag | switch source |

**Global chrome:** left nav with the 7 destinations; a persistent **proof-boundary banner** (local-only / no secrets); a **Mirror/Courier badge** wherever Linear/Slack/GitHub appears; an **Owner Attention legend** (the 6 states with their colors).

**Navigation principle:** Command Center is the only screen the owner *needs*; everything else is drill-down. Attention states are clickable filters (click "approval required" on Home → filtered Gate Queue).

---

## 6. Component & status-system seeds (handed to ATM-385)

- **Attention pill** — 6 variants (the §3.3 states) → color + label + icon. The single most-reused component.
- **Stage rail** — horizontal 11-step lifecycle with per-step `state`/`proof_state` styling.
- **Room card**, **Mission card**, **Proof card**, **Gate card** — summary tiles for list/board views.
- **Non-claims callout** — a recurring muted block rendering `non_claims[]` next to any claim.
- **Mirror/Courier badge**, **proof-boundary banner**, **review-loop stepper** (`observe→validate→govern→review→sync`).

---

## 7. Assumptions

- A1. The cockpit reads the **same JSON schemas** the engine writes; no schema changes to core WEAVE this sprint.
- A2. Default data source is a committed **fixture** home; pointing at a live `runs/cos-weave-home/` is optional and behind a flag.
- A3. Owner actions persist to a **local overlay** under gitignored `runs/`, leaving fixtures pristine.
- A4. All external effects (deploy, Slack/Linear/GitHub writes) are **simulated and logged**, never executed; the cockpit makes no outbound network calls.
- A5. Runtime identities in committed fixtures are `Codex`, `Claude`, `Local runtime` to satisfy the repo's `public_safe_repo_scan.py`, which blocks the legacy runtime term ATM-383 lists as an example.

## 8. Open questions (raise with George Monday in ATM-384)

- Q1. OK to add an **isolated Node/Next.js toolchain** under `cockpit/` (core WEAVE stays zero-dependency Python; `node_modules`/`.next` gitignored)?
- Q2. OK to substitute `Codex / Claude / Local runtime` for the example runtime name ATM-383 lists in committed fixtures? *(Required — the CI scanner `public_safe_repo_scan.py` flags that term as a legacy surface.)*
- Q3. Is **live mode** (point cockpit at a real `runs/cos-weave-home/`) in scope this week, or is fixture-only acceptable for the MVP?
- Q4. Is committing the cockpit under a new top-level `cockpit/` folder (vs `packages/`) acceptable for repo layout?
- Q5. For the "second channel to the agent," is a **locally-stored note** (no real send) the right MVP boundary, or is even local note-taking out of scope?

## 9. Out of scope / hard gates (restated)

No production deploy/hosting; no real Slack/Linear/GitHub writes; no DNS/OAuth/Supabase/Vercel/env mutation; no billing/wallet/token movement; no secret handling; no public sends; no inter-Castle (Treaty/Embassy) federation; no claim that WEAVE 0.2 is final. Gated/external actions are **simulated only**.

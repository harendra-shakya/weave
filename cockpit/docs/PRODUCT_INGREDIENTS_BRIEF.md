# WEAVE 0.2 — Product Ingredients Brief (Local Owner Cockpit)

> Deliverable for **[ATM-384](https://linear.app/atumera-llc/issue/ATM-384/weave-02-product-ingredients-user-stories-for-local-owner-cockpit)**.
> Status: **v3 — canonical-model rewrite** (per George's 2026-06-30 issue update). Prerequisite for wireframes (ATM-385) and build (ATM-386).
> This brief uses the **current WEAVE 0.2 model** — *Domain · Node · Workspace · Agent · Task · Event · Proof · Gate · Mirror · Context Pack* — as the **primary vocabulary**. Legacy/product-copy terms (Castle, Room, Mission, Knight, Runtime, Courier) are retained only as clearly-labeled secondary aliases. Every primitive is mapped to a real schema/file verified in `scripts/weave_cos_skeleton.py` and the committed sample `docs/samples/cos-weave-skeleton/`, so design and build can proceed without inventing structure.

---

## 0. Product brief

**What is being built.** A **local owner cockpit** for WEAVE 0.2: a read-and-act UI over the local WEAVE state folder so the owner can *see* the state of everything being built at a glance, *inspect* any claim down to its evidence, and *take the few decisions that are genuinely his* — without reading raw JSON.

**Who it is for.** The **owner/operator** (George) — the sovereign decision-maker for the Domain. Secondarily it is a second channel for talking to the **Agents** that do the work.

**What problem it solves.** WEAVE today is a local-file "Chief of Staff" skeleton: an agent thread maintains a folder of JSON/markdown recording each Workspace, its lifecycle stage, Proof, blockers, Gates, and review state. The only "cockpit" today is a single text state line. The owner cannot see at a glance what needs him or trace why a thing is in its current state. The cockpit makes that state **understandable, inspectable, and safely actionable**.

**What is local-only.** Everything. The cockpit reads a local folder and writes owner decisions to a local overlay file. It makes **no outbound network calls** and requires **no secrets** to run in demo mode.

**What is not yet production-proven.** No production deploy/hosting; no real Mirror writes (Linear/Slack/GitHub); the data is **fixture-backed** by default; gated/external actions are **simulated and logged**, never executed. Nothing here claims WEAVE 0.2 is final or externally verified.

**The cockpit's job statement:** *"Show me what needs me, let me inspect why, let me act locally and safely, and never lie to me about what is real."*

---

## 1. Vocabulary & model mapping (canonical primitive → real repo data)

The **canonical WEAVE 0.2 model** is the primary vocabulary. Each primitive is defined twice: the **concept** (how to talk about it to the owner) and the **substrate** (the actual file/schema the cockpit reads).

| Canonical primitive | Concept (owner-facing) | Substrate (file · schema) |
|---|---|---|
| **Domain** | The owner's sovereign WEAVE graph — the root that owns all Nodes and Workspaces. | `state.json`, `owner-profile.json`, `updates/readback.json`, `updates/events.jsonl` · `weave-cos-skeleton/v0.1` |
| **Node** | A runtime host/environment within the Domain where Agents execute and state is kept. *New in 0.2 — see §8 Q-N.* | **NEW** `node.json` (cockpit fixture); local MVP = one `local-node` |
| **Workspace** | One app/product the owner is building; its own workspace with lifecycle and Proof. | `apps/registry.json` + `apps/<id>/app.json` + `apps/<id>/lifecycle.json` · `weave-cos-app/v0.1`, `weave-cos-lifecycle/v0.1` |
| **Agent** | The runtime identity executing a Task (`Codex` / `Claude` / `Local runtime`). | `agents.json` + `app.json#worker_orchestration` + task assignment |
| **Task** | A bounded unit of work given to an Agent, with explicit objective, allowed/forbidden actions. | `apps/<id>/tasks.json` (`weave-cos-task-ledger/v0.1`) + `worker-packets/WP-*.md` |
| **Event** | The append-only history of what happened and what was proven. | `updates/events.jsonl` · `weave-cos-event/v0.1` |
| **Proof** | A claim plus its evidence, target surface, and explicit non-claims — the unit that advances state. | `apps/<id>/proof/proof-tray.json` items · `weave-proof-envelope/v0.1` |
| **Gate** | A risky transition that is blocked until a required approval/proof exists. | `apps/<id>/deployment-gates.json` (`weave-deployment-gates/v0.1`) + eval hard gates in `packages/weave-tool/evals/lifecycle/*.yaml` |
| **Mirror** | External tools (Linear/Slack/GitHub) that *reflect* or *carry* state but are **never the source of truth**. | `app.json#tracker` (`mode: "local"`, `linear_required: false`) |
| **Context Pack** | The bounded context handed to an Agent for a Task: objective, allowed actions, forbidden actions, non-claims, and referenced packet/contracts. *New framing in 0.2 — see §8 Q-CP.* | composed from `tasks.json` (`objective`, `allowed`, `forbidden`, `non_claims`, `worker_packet_ref`) + `WP-*.md` + `consulted_contract_refs[]` |

### 1A. Supporting concepts (canonical, not standalone primitives)

| Concept | Definition | Substrate |
|---|---|---|
| **Owner Attention state** | The single status that tells the owner whether a thing needs them — the cockpit's core derived vocabulary. | *Derived* (see §3.3) from blockers + review queue + stage `proof_state` + Gates |
| **Review loop** | The mandatory `observe → validate → govern → review → sync` sequence before any claim is accepted. | `review_loop` arrays; `proof-tray#review_loop_state`; `review/review-queue.json` |
| **Stage-entry contract** | The eval+procedure+primitive+skills bundle loaded before a stage acts. | `state.json#stage_entry_contracts[]` · `weave-stage-entry-contract/v0.1` |
| **Non-claim** | An explicit statement of what is **not** proven — shown next to every claim. | `non_claims[]` on app, lifecycle, Proof, Gate |

### 1B. Legacy / product-copy aliases (secondary only)

These earlier terms may appear **only** as clearly-labeled product copy; the implementation and evaluation model use the canonical names above.

| Legacy / product-copy term | Canonical primitive |
|---|---|
| Home / Castle | **Domain** |
| Room / App Workspace | **Workspace** |
| Mission / bounded work packet | **Task** |
| Runtime / worker / Knight | **Agent** |
| Proof Envelope | **Proof** |
| Event Log / Proof Ledger | **Event** |
| Courier | **Mirror** (carry-variant) |
| Treaty / Embassy (future inter-Domain) | *out of scope this sprint* |

---

## 2. Actors / personas

Who the cockpit serves and represents. Only the Owner takes binding decisions; everyone else produces state the Owner inspects.

| Actor | Who / what | Goal in the cockpit | Authority |
|---|---|---|---|
| **Owner / operator (George)** | The sovereign decision-maker for the Domain. | See what needs him, inspect why, take the few decisions that are genuinely his. | **Full** — approves/holds Gates, acknowledges blockers, marks ready-for-review. The only actor who can clear an approval. |
| **Agent runtimes** | The Agent identities executing Tasks: `Codex`, `Claude`, `Local runtime`. | Emit checkpoints, raise blockers / input-requests, advance stages by recording Proof. | None over Gates. *(The legacy example runtime name ATM-383 once listed is substituted here — see §8 Q-A.)* |
| **Reviewer / evaluator** | The review loop (`observe→validate→govern→review→sync`) and eval hard gates in `packages/weave-tool/evals/lifecycle/*.yaml`. | Validate Proof before a claim is accepted; emit `ACCEPT_FOR_SCOPE` / `REVISE` / `BLOCKED` / `NEEDS_OWNER_ACTION`. | Automated; can block a transition but cannot grant an owner approval. May be the Owner acting as reviewer. |
| **External systems (Mirrors)** | Linear, GitHub, Slack. | Reflect or carry state outward. | **Never source of truth.** This sprint they are shown disconnected / simulated; no real writes. |
| **Future peer Domain** | Another owner's sovereign graph (Treaty/Embassy). | Inter-Domain cooperation. | **Out of scope** — placeholder only; not built this sprint. |

---

## 3. User stories / Jobs-To-Be-Done (owner = George)

Prioritized; each maps to a screen (§5) and carries an **acceptance / proof note** (what QA in ATM-387 checks).

**Epic A — Situational awareness ("what needs me?")**
- **A1.** As the owner, I want one screen showing everything that needs my attention (approvals, blocked, ready-for-review), so I don't have to open each Workspace. → *Command Center*
  - **Acceptance:** every item whose derived attention (§3.3) ∈ {blocked, approval required, needs owner, ready for review} appears, severity-sorted; the on-screen counts equal the sum across all Workspaces' trays.
- **A2.** As the owner, I want to see all my Workspaces and each Workspace's current lifecycle stage and status at a glance. → *Workspace List*
  - **Acceptance:** each Workspace row shows `current_stage` and exactly one attention pill matching the §3.3 derivation.
- **A3.** As the owner, I want to see the latest Agent checkpoints so I know my Agents are alive and where they are. → *Command Center / Agents panel*
  - **Acceptance:** latest checkpoint per Agent shows derived health + age; rendered from fixture data with **no outbound network call**.

**Epic B — Inspection ("why is this the state?")**
- **B1.** As the owner, I want to open a Workspace and see its 11-stage lifecycle rail with which stage is active, complete, or blocked. → *Workspace Detail*
  - **Acceptance:** the rail renders all 11 stages in order, each with its `state` + `proof_state` taken verbatim from `lifecycle.json`.
- **B2.** As the owner, I want to open a Task and read its objective, **Context Pack** (allowed/forbidden actions, non-claims), assigned Agent, and Proof status. → *Task Detail*
  - **Acceptance:** objective, the Context Pack's Allowed vs Forbidden, assigned Agent, and Proof status all render from `tasks.json` + the linked `WP-*.md`; nothing is hard-coded.
- **B3.** As the owner, I want to inspect a Proof: the claim, its evidence refs, the proof surface, and crucially the **non-claims**, so I never mistake local proof for deployment/live proof. → *Proof Ledger*
  - **Acceptance:** `claim`, `proof_surface`, `artifact_refs[]`, and `non_claims[]` are all visible; a real local Proof and a `SIMULATED` external effect are visually distinct.
- **B4.** As the owner, I want to see exactly why something is blocked and what the safe next action is. → *Workspace Detail / Gate Queue*
  - **Acceptance:** the blocker's `state`, `missing[]`, and `next_action` are shown; no action button performs the external effect.

**Epic C — Action ("let me decide, safely")**
- **C1.** As the owner, I want to approve, hold, or defer a gated action, with the decision persisted, while any external effect is **simulated only**. → *Gate / Approval Queue* (the sprint's required owner action)
  - **Acceptance:** Approve/Hold writes the decision to the local overlay and appends an Event tagged `SIMULATED`; **no external call is made**; the decision survives refresh **and** dev-server restart.
- **C2.** As the owner, I want to acknowledge a blocker / mark an item ready-for-review and have it stick across refresh and restart. → *any screen → overlay*
  - **Acceptance:** the overlay write is reflected after a full reload and after a process restart (read back from the overlay file, not memory).
- **C3.** As the owner, I want to leave a note for an Agent as a second channel of communication, written locally with no real send. → *Agents panel*
  - **Acceptance:** the note persists to the local overlay; no message is sent to any external surface.

**Epic D — Trust ("never lie to me")**
- **D1.** As the owner, I want every screen to make the proof boundary explicit: what is proven, fixture-backed, local-only, and not-verified. → *Settings + persistent boundary banner*
  - **Acceptance:** the boundary banner is present on every route; Settings states, in words, what is proven vs fixture-backed vs local-only vs not-externally-verified, and which Node is in use.
- **D2.** As the owner, I want Linear/Slack/GitHub clearly labeled as Mirrors, not the source of truth. → *Mirror badge on relevant screens*
  - **Acceptance:** every Linear/Slack/GitHub reference carries a "Mirror — not source of truth" badge and a disconnected/simulated status.

---

## 4. Domain object & state model

### 4.1 Core objects and key fields (exact, from real data)

- **Domain** (`weave-cos-skeleton/v0.1`): `active_app_id`, `app_count`, `state` (`local_skeleton_ready`), `review_loop`, `stage_entry_contracts[]`, `non_claims[]`, `surface` (`codex`). *Cockpit adds a `node` reference (see Node).*
- **Node** (`node.json`, cockpit fixture — **new**): `node_id` (`local-node`), `kind` (`local`), `host` (`local machine`), `hosts_agents[]`, `state_path`, `non_claims[]`. *Local MVP models exactly one Node; see §8 Q-N.*
- **Workspace** (`weave-cos-app/v0.1`): `app_id`, `name`, `owner_intent`, `current_stage`, `requested_stage`, `state`, `missing_gates[]`, `tracker{mode,linear_required}`, `worker_orchestration{mode}`, `intent_truth{...}`, `deployment_gates{...}`, `non_claims[]`, `next_action`.
- **Lifecycle** (`weave-cos-lifecycle/v0.1`): `stages[]` where each stage = `{ stage, label, state, proof_state, procedure_ref, stage_entry_contract }`.
- **Task** (`weave-cos-task/v0.1` in `weave-cos-task-ledger/v0.1`): `task_id`, `app_id`, `stage`, `state`, `objective`, `worker_packet_ref`, `review_loop`, plus the Context-Pack fields `allowed[]`, `forbidden[]`, `non_claims[]`, assigned `runtime` (Agent), `due`, `proof_state`.
- **Context Pack** (composed view — **new framing**): `{ objective, allowed[], forbidden[], non_claims[], worker_packet_ref, consulted_contract_refs[] }` for one Task. The cockpit composes this from `tasks.json` + the `WP-*.md` body; it is the "what this Agent may and may not do" contract shown on Task Detail and beside Proof.
- **Proof** (`weave-proof-envelope/v0.1`): `claim`, `proof_surface` (e.g. `TOOL_VERIFIED_LOCAL`), `artifact_refs[]`, `consulted_contract_refs[]`, `review_loop_state{observe,validate,govern,review,sync}`, `non_claims[]`, `state` (`recorded`), `task_id`.
- **Gate** (`weave-deployment-gates/v0.1`): `state` (`deployment_blocked_until_provider_access_validated`), `launch_allowed`, `local_progress_allowed`, `blocked_by_provider_access`, `providers[]{provider, proof_state, required_capabilities[]}`, `non_claims[]`.
- **Blocker** (`weave-cos-blocker-tray/v0.1`): `blockers[]{ id, state, missing[], next_action }`.
- **Review item** (`weave-cos-review-queue/v0.1`): `items[]{ id, artifact_refs[], decision, loop[], state }`.
- **Event** (`weave-cos-event/v0.1`): `{ app_id, at, event, intent, state, simulated?, blast_radius? }` (one JSON object per line in `events.jsonl`).
- **Agent** (composed view; `agents.json` + `app.json#worker_orchestration` + task assignment): `identity` (`Codex` / `Claude` / `Local runtime`), `health` (see §4.2), `status`, assigned `task_id`, `app_id`, `at`, optional `input_request`, `history[]`. *0.1 stores no standalone runtime schema — the cockpit composes this.*
- **Mirror** (`app.json#tracker`): `tool` (`Linear` / `Slack` / `GitHub`), `kind` (`Mirror` | `Courier` *(legacy)*), `connection` (`disconnected` / `simulated` / `connected`). **Never the source of truth.**
- **AttentionItem** (derived, not stored): `{ subject_ref (workspace | task | gate), attention_state (§3.3), reason, source_field, target_route }` — the unit the Command Center lists and severity-sorts.

### 4.2 Enumerations (use these exact strings as UI labels)

- **Lifecycle stages (11, ordered):** `intent → research → selection → plan → engineering → qa → deployment → kpi-setup → marketing → iteration → analysis`.
- **Stage `state`:** `active`, `complete`, `blocked_by_prior_gates`, `not_started`.
- **Stage `proof_state`:** `missing`, `not_required_yet`, `recorded` (proven), `not_started`.
- **Blocker `state`:** `open_question`, `blocked_until_validated`.
- **Review `decision` / `state`:** `not_accepted_as_done` / `pending_owner_context` (→ accepted state: `ACCEPT_FOR_SCOPE`).
- **Gate `proof_state` (per provider):** `not_validated`, `validated`.
- **Allowed done states (completion contract):** `ACCEPT_FOR_SCOPE`, `DONE_FOR_SCOPE_ONLY`, `REVISION_REQUIRED`, `BLOCKED`, `NEEDS_OWNER_ACTION`.
- **Task states** (normalized for the board): `not_started`, `in_progress`, `awaiting_review`, `done_for_scope`, `blocked`, `needs_owner_action`.
- **Agent health** (derived): `healthy` (recent checkpoint, no open input-request), `idle` (no active Task), `blocked` (awaiting owner input / open blocker), `offline` (no recent checkpoint).
- **Mirror / readback states:** mirror `connection` = `disconnected` | `simulated` (this sprint) | `connected` (future); **readback** (`updates/readback.json`) = `pending` | `acknowledged` | `stale`.
- **Node state:** `local` (this sprint — single local host); future: multiple/remote Nodes (out of scope).

### 4.3 Owner Attention state — the derived status (cockpit's core vocabulary)

WEAVE does not store a single "attention" field; the cockpit **derives** it per Workspace/Task. Six states, evaluated in **priority order** (a Workspace shows its highest-priority match):

| Priority | Attention state | Derivation rule (over real fields) |
|---|---|---|
| 1 | **blocked** | any blocker `state == "blocked_until_validated"`, or current stage `state == "blocked_by_prior_gates"`, or gate `blocked_by_provider_access == true` while deployment is requested |
| 2 | **approval required** | a Gate is pending owner approval (`launch_allowed == false` with `requested_stage` at/after `deployment`), or completion `allowed_done_state == "NEEDS_OWNER_ACTION"` |
| 3 | **needs owner** | a blocker `state == "open_question"`, or unanswered onboarding context |
| 4 | **ready for review** | a Proof `state == "recorded"` with a review item still `pending_owner_context` / `not_accepted_as_done` |
| 5 | **stale / no-proof** | the `current_stage` has `proof_state == "missing"` and no recent Event advancing it |
| 6 | **none** | nothing pending; current Proof recorded and review accepted |

This derivation lives in `lib/attention.ts` and is the **first thing built test-first** (ATM-386, TDD), because every screen depends on it.

### 4.4 State transitions the cockpit reflects (does not drive)

WEAVE's rule: **Proof advances state; Gates block transitions.** The cockpit visualizes this and lets the owner record *local* decisions; it never silently converts one Proof kind into another. The owner action in scope (Gate approve/hold) writes a **local overlay** + an Event, and marks external effects `SIMULATED`.

---

## 5. Screen inventory & information architecture

The owner-cockpit screens (per ATM-383/385), with routes (Next.js App Router) and primary data sources:

| # | Screen | Route | Reads | Owner action |
|---|---|---|---|---|
| 1 | **Command Center** | `/` | `state.json`, `node.json`, `registry.json`, aggregated trays, latest Events | none (navigation hub) |
| 2 | **Workspace List** | `/workspaces` | `registry.json` + each `app.json` | none |
| 2b | **Workspace Detail** | `/workspaces/[id]` | `app.json`, `lifecycle.json`, Proof/blocker/review trays | acknowledge blocker |
| 3 | **Task Board** | `/tasks` | all Workspaces' `tasks.json` | none |
| 3b | **Task Detail** | `/tasks/[id]` | `tasks.json` + `WP-*.md` (Context Pack) + linked Proof | mark ready-for-review |
| 4 | **Proof / Evidence Ledger** | `/proof` | `proof-tray.json` across Workspaces + `events.jsonl` | none |
| 5 | **Gate / Approval Queue** | `/gates` | `deployment-gates.json` + eval hard gates | **approve / hold / defer (local-only)** |
| 6 | **Agents panel** | `/agents` | `agents.json`, `worker_orchestration`, latest checkpoints | post local note |
| 7 | **Settings / Data Source** | `/settings` | resolved Domain path, Node, fixture-vs-live flag | switch source |

**Global chrome:** left nav with the destinations; a persistent **proof-boundary banner** (local-only / no secrets); a **Mirror badge** wherever Linear/Slack/GitHub appears; an **Owner Attention legend** (the 6 states with their colors); a **Domain · Node** header strip identifying the active graph + host.

**Navigation principle:** Command Center is the only screen the owner *needs*; everything else is drill-down. Attention states are clickable filters (click "approval required" on Command Center → filtered Gate Queue).

---

## 6. Workflow map — the demo owner journey

The single end-to-end journey the MVP must demonstrate (success criterion in ATM-383):

```
Command Center  (Domain + Node shown)
  → (owner sees a Workspace flagged "approval required")
Workspace Detail
  → (lifecycle rail shows deployment stage blocked by a Gate)
Task Detail
  → (the Task that requested deployment; objective + Context Pack forbidden actions + Proof status)
Proof / Gate
  → (inspect the Proof + the Gate's required approval, risk/blast radius, non-claims)
Required action: Approve (local-only)
  → decision persisted to overlay; Event appended as SIMULATED external effect;
    attention state recovers; survives refresh + restart.
```

Secondary journeys: acknowledge an `open_question` blocker (needs owner → none); post a note to an Agent (Agents panel); toggle fixture vs live Domain (Settings).

---

## 7. Component & status-system seeds (handed to ATM-385)

- **Attention pill** — 6 variants (the §4.3 states) → color + label + icon. The single most-reused component.
- **Stage rail** — horizontal 11-step lifecycle with per-step `state`/`proof_state` styling.
- **Workspace card**, **Task card**, **Proof card**, **Gate card** — summary tiles for list/board views.
- **Context Pack panel** — Allowed vs Forbidden vs Non-claims for one Task, shown on Task Detail and beside Proof.
- **Domain · Node header strip** — identifies the active graph + host on every screen.
- **Non-claims callout** — a recurring muted block rendering `non_claims[]` next to any claim.
- **Mirror badge**, **proof-boundary banner**, **review-loop stepper** (`observe→validate→govern→review→sync`).

---

## 8. Assumptions

- A1. The cockpit reads the **same JSON schemas** the engine writes; no schema changes to core WEAVE this sprint. `Workspace` is the UI/model name over the engine's `apps/<id>/app.json`; `app_id` is kept as the engine id.
- A2. Default data source is a committed **fixture** Domain; pointing at a live `runs/cos-weave-home/` is optional and behind a flag.
- A3. Owner actions persist to a **local overlay** under gitignored `runs/`, leaving fixtures pristine.
- A4. All external effects (deploy, Mirror writes) are **simulated and logged**, never executed; the cockpit makes no outbound network calls.
- A5. Agent identities in committed fixtures are `Codex`, `Claude`, `Local runtime` to satisfy the repo's `public_safe_repo_scan.py`, which blocks the legacy runtime term ATM-383 once listed as an example.
- A6. The local MVP models a **single Node** (`local-node`); the Domain owns that one Node.

## 9. Open questions (need George's decision)

**New-primitive semantics (introduced by the 2026-06-30 canonical model; defined here as working assumptions, flagged for confirmation):**
- **Q-N (Node).** This brief defines **Node** as the local host/runtime environment within the Domain where Agents execute and state is kept, modeled as a single `local-node` for the MVP. Is that the intended meaning, or should Node mean a physical machine/host, a per-Agent runtime sandbox, or a logical environment (dev/prod)?
- **Q-D (Domain).** This brief treats **Domain** as the owner's whole sovereign graph (former Home/Castle), shown as a single Domain. Confirm there is exactly one Domain per cockpit instance for the MVP.
- **Q-CP (Context Pack).** This brief composes **Context Pack** from a Task's `objective + allowed + forbidden + non_claims + worker_packet_ref + consulted_contract_refs`. Confirm "Context Pack" is the intended name for this bundle, and whether it should also carry the stage-entry-contract refs.

**Carried-over operational questions:**
- **Q-A (Agent naming).** OK to substitute `Codex / Claude / Local runtime` for the example runtime name ATM-383 once listed, in committed fixtures? *(Required — `public_safe_repo_scan.py` flags that term as a legacy surface.)*
- **Q3.** Is **live mode** (point cockpit at a real `runs/cos-weave-home/`) in scope this week, or is fixture-only acceptable for the MVP?
- **Q5.** For the "second channel to the Agent," is a **locally-stored note** (no real send) the right MVP boundary?

## 10. Out of scope / hard gates (restated)

No production deploy/hosting; no real Mirror (Slack/Linear/GitHub) writes; no DNS/OAuth/Supabase/Vercel/env mutation; no billing/wallet/token movement; no secret handling; no public sends; no inter-Domain (Treaty/Embassy) federation; no claim that WEAVE 0.2 is final. Gated/external actions are **simulated only**.

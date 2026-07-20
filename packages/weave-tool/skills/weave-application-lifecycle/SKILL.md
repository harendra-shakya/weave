---
name: weave-application-lifecycle
description: Drive any application from first idea through live iteration using the WEAVE 11-stage lifecycle — autonomously advancing stage by stage with explicit gates, evidence, and owner checkpoints.
---

# WEAVE Application Lifecycle

## Use When

Use this skill when:

- starting a new application of any kind (SaaS, API, CLI, mobile, marketplace,
  internal tool, data product, or anything else);
- resuming an application that has stalled at a lifecycle gate;
- checking whether an application is ready to advance to the next stage;
- running the lifecycle loop autonomously so stages advance without manual
  prompting between each one.

This skill works for any application type. It does not assume a technology stack,
commerce model, or deployment target.

That is the design. Where it has actually been *proven* is narrower, and
[`ENVELOPE.md`](ENVELOPE.md) records that boundary honestly — including the
limitations you will meet inside it. Read it before relying on a stage's verdict.

## Inputs

- **app id** — short slug identifying the application (e.g. `my-tool`, `acme-api`)
- **application description** — what the app does and who it is for
- **current stage** — inferred from `lifecycle/lifecycle-state.json` if the app
  already exists; otherwise assume `intent`
- **owner constraints** — what is explicitly off-limits or requires approval
- **prior evidence** — any completed stage proof already on disk

## Outputs

- lifecycle-state.json updated with the current stage verdict
- stage proof written to `proof/` (eval result, procedure readback, artifacts)
- next stage prompt or explicit blocker with reason
- owner approval request if a gated stage is reached

## The Two Modes

`"mode"` in `lifecycle-state.json` selects how the lifecycle treats the owner. It
defaults to `loop` when the field is absent, so a state file written before modes
existed keeps its current behavior.

| Mode | Behavior | For |
|------|----------|-----|
| `loop` | Stages advance without prompting. The stage prompt names the platform skills for that stage and gets out of the way. | Owners who already have the answers — engineers, repeat cycles, iteration runs. |
| `guided` | A **pre-intent** phase runs first (`weave-guided-intake`), extracting brand vision, one specific target customer, success criteria, and visual direction from a shallow prompt. Every stage prompt then grills for depth before work begins. | Owners who want a production-grade app from "I want to build a store" and do not yet know terms like design tokens or target persona. |

Pre-intent is not a stage — it has no entry in the stage table below and no eval
contract. It is a gate ahead of `intent`, and writing `lifecycle/intake.json` is
what closes it. Once intake exists (or `intent` is already verified), guided mode
runs the same 11 stages as loop mode.

Each stage prompt names that stage's platform skills, drawn from
`packages/weave-tool/skill-registry.json`. That registry is the seam between
WEAVE's process stages and the craft skills (brand, design, copy, growth) the
lifecycle does not implement itself.

## The 11 Stages

```
[pre-intent]† → intent → research → selection → plan → engineering → qa
       → deployment* → kpi-setup → marketing* → iteration → analysis → (loop)
```

`†` = guided mode only; not a stage.

`*` = owner-gated. Requires explicit owner approval and external access proof
before the stage can proceed. The lifecycle loop skips these and continues
to the next non-gated stage, flagging them for the owner.

| Stage | What it proves | Unlocked by | Owner gate |
|-------|---------------|-------------|------------|
| intent | The problem and target user are worth investigating | owner | — |
| research | Product-market facts, risks, and disconfirming evidence are visible | intent | — |
| selection | The right solution is chosen from real alternatives | research | — |
| plan | A bounded implementation plan exists with acceptance checks | selection | — |
| engineering | The app runs, tests pass, and behaviors are verified | plan | — |
| qa | All specified behaviors are covered and non-claims are recorded | engineering | — |
| deployment | The app is live at a real URL | qa | **YES** |
| kpi-setup | A baseline metric run exists with a repeatable measurement method | qa | — |
| marketing | A launch campaign exists and is ready to send | kpi-setup | **YES** |
| iteration | At least one improvement cycle (adapt → measure → decide) is complete | kpi-setup | — |
| analysis | The app's trajectory is documented and the next investment is decided | iteration | — |

## Rules

- Infer the current stage from `lifecycle/lifecycle-state.json`. Do not ask the
  owner to classify the stage.
- Load the stage-entry contract before acting:
  `packages/weave-tool/evals/lifecycle/<stage>.yaml` and the app's
  `lifecycle/<stage>/procedure.md` if it exists.
- Do not advance a stage without recorded proof in `proof/`.
- Owner-gated stages (`deployment`, `marketing`) must stop and emit an explicit
  owner action request. Do not proceed past them automatically.
- Returning to an earlier stage requires an overwrite record naming the reason
  and listing affected downstream stages.
- Non-claims must be recorded whenever a stage proves less than it appears to.
- A stage is not verified until its eval score meets the minimum threshold
  defined in the eval YAML (`advance_min_score_percent`).

## Procedure

1. Read `lifecycle/lifecycle-state.json` for the app. If it does not exist,
   create it from the template at
   `packages/weave-tool/skills/weave-application-lifecycle/templates/lifecycle-state.template.json`.
2. Identify the first stage whose `state` is not `verified` or
   `owner_gated_not_pursued`.
3. If that stage is owner-gated, stop. Emit an owner action request with what
   is needed (provider access, approval record, etc.) and which stage is blocked.
4. Load the stage-entry contract for that stage.
5. Perform the stage work according to the eval rubric and procedure. `engineering`
   and `qa` have hard command gates that actually execute — run them with:
   ```sh
   python3 scripts/weave_eval.py <stage> --run-gates --app-path <path-to-your-app>
   ```
   Omit `--app-path` only when the app lives inside the weave-tool repo itself.
   Pointing it at your app's root is what makes the test/build/scan commands
   run against your app instead of the weave-tool repo.
6. Write proof to `proof/<stage>-eval-result.json` (or the path the eval specifies).
7. Update `lifecycle-state.json`: set `state` to `verified`, add `eval_result_ref`
   and `eval_score_percent`.
8. Return to step 2 — repeat until all stages are complete or a gate is reached.

## Autonomous Loop

The lifecycle runner automates steps 1–3:

```sh
node packages/weave-tool/skills/weave-application-lifecycle/runner/lifecycle-runner.mjs \
  --app <app-id> \
  --root <path-to-repo-containing-the-app>
```

The runner reads the lifecycle state, finds the next actionable stage, and
prints the stage prompt. Claude reads the prompt, does the work, and the caller
runs the runner again to get the next prompt. This loop requires no manual
inter-stage prompting.

When all non-owner-gated stages are complete, the runner prints:
`ALL STAGES COMPLETE — ready to seal and close.`

## Proof Requirements by Stage

| Stage | Minimum proof |
|-------|--------------|
| intent | `intent.json` with goal, target user, success criteria, non-goals |
| research | Research doc with sourced facts, assumptions, opinions separated |
| selection | Selection record with alternatives considered, decision rationale |
| plan | Implementation plan with acceptance checks and approval gates |
| engineering | Tests pass, behaviors browser- or runtime-verified |
| qa | QA eval result, behaviors coverage list, non-claims recorded |
| deployment | Live URL, deployment log, DNS/hosting provider confirmed |
| kpi-setup | Baseline metric run, measurement method documented, digest recorded |
| marketing | Campaign assets, send plan, owner approval record |
| iteration | Adaptation applied, measurement rerun, GO/ITERATE/PIVOT/STOP decision |
| analysis | Analysis doc, trajectory summary, next investment decision |

## Deterministic Measurement (kpi-setup / iteration)

`kpi-setup` and every later stage depend on one property: **the same seed
produces the same event stream, every time.** That is what makes a baseline
freezable and a retest meaningful — if the retest cannot reproduce the
baseline's own numbers on the same seed, nothing it reports about an
adaptation can be trusted either.

- `tools/generate-events.mjs --seed <int> --count <int> [--schema <path>] [--output <path>]`
  generates the synthetic feedback/funnel/order/refund event stream. The
  default funnel is `view → engage → convert → fulfill → refund`; pass
  `--schema` (see `examples/event-schema.example.json`) to model a different
  funnel. Same seed, same `--count`, same schema → byte-identical output,
  every run.
- **Digest** means a checksum of that output — hash the generated events file
  (or run `tools/seal.mjs` over the directory containing it) once for the
  frozen baseline and again after the retest. Identical seed, identical
  digest is the proof the retest reran the same stream; a differing digest on
  an identical seed means something non-deterministic leaked in and the
  comparison is invalid until that is fixed.
- `tools/kpi-compare.mjs --baseline <path> --current <path>` reports the delta
  between two KPI snapshots computed from those event streams — this is what
  the iteration stage's GO/ITERATE/PIVOT/STOP decision is based on.

## Stop Conditions

A stop is recorded, not worked around. Every stop is one of two kinds, and the
record must name which:

| Stop | Means | Who unblocks it |
|------|-------|-----------------|
| `ENGINEERING_REQUIRED` | The lifecycle cannot proceed without work outside its competence — a code change, adapter, schema migration, or security fix the skill cannot produce from evidence alone. | An engineer |
| `OWNER_GATE` | The lifecycle is blocked on a decision or access only the owner holds — approval, credentials, provider access, or an amendment to something already frozen. | The owner |

Record `ENGINEERING_REQUIRED` by setting that stage's `state` to
`engineering_required` in `lifecycle-state.json` (not `verified`, and not left
`in_progress`). The runner recognizes this state, stops there, and tells the
next operator what is blocked — it does not let the loop continue past it,
and it does not require overruling a failed gate to record the stop.

Stop and emit the matching record when:

- a stage lacks evidence and the eval minimum score cannot be met
  (`ENGINEERING_REQUIRED` if the gap is buildable, `OWNER_GATE` if it needs a
  decision);
- a gated stage (`deployment`, `marketing`) is reached without an owner approval
  record — `OWNER_GATE`;
- the plan requires live credentials, real payments, or real user data the owner
  has not authorized — `OWNER_GATE`;
- a downstream stage contradicts a prior sealed stage and no overwrite record
  exists — `OWNER_GATE`;
- correcting a defect would require editing a frozen contract, seed, or KPI
  definition — `OWNER_GATE`. Freezing is what makes retests meaningful; a
  lifecycle that unfreezes its own baseline to make a number look better has
  destroyed the evidence it exists to produce.

Do not downgrade a stop to a warning to keep the loop moving. An unrecorded stop
is a false claim of completion.

## Verification

Closeout is valid when:
- every non-owner-gated stage shows `state: verified` in lifecycle-state.json;
- every verified stage has a proof artifact on disk that another agent or reviewer
  can open and check without needing this conversation;
- all owner-gated stages are either verified (with approval record) or explicitly
  marked `owner_gated_not_pursued`.

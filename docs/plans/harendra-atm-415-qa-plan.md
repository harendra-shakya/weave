# ATM-415 WEAVE V5 Sprint Plan — Three Commerce Apps + Reusable Creation Lifecycle

Owner: Harendra. Controller: George. Due: Friday 2026-07-17.
Umbrella: ATM-415. Children: ATM-416, ATM-417, ATM-418, ATM-419, ATM-420, ATM-421, ATM-422, ATM-423.

## Context

The sprint tests whether WEAVE can operate a full application lifecycle — not just generate documents — by building three local, synthetic-only commerce applications (video storefront, sticker storefront, strictly chainless synthetic NFT storefront), running each through a frozen deterministic feedback/funnel/sales/refund cohort, applying one bounded WEAVE-directed adaptation, rerunning the identical cohort, and producing evidence-backed GO / ITERATE / PIVOT / STOP analysis. It also delivers a reusable `weave-application-lifecycle` skill proven by a fresh operator building a fourth app, followed by a fully audited evidence seal.

Controller meta-directive: QA what is assigned, comprehend and suggest improvements, build skills and loops for recurring processes, and make the processes reproducible with AI.

## Recorded sprint decisions

- **Execution hold**: the Backlog-to-Todo transition on 2026-07-14 is treated as controller clearance. The interpreted source-authority fields are recorded as an ATM-415 comment so the controller can veto immediately if the interpretation is wrong.
- **Source roots**: this weave repository (branch `atm-415-weave-qa`) for contracts, skill, plan, and evidence; a new sibling repository `weave-v5-apps` (created next to this checkout, own git history) for the three application builds.
- **Stack**: Next.js/TypeScript for the three storefronts; the weave repository itself stays Python-stdlib-only.
- **ATM-422 fresh operator**: a fresh AI agent session given only the skill and public sprint artifacts — verifiably context-free via transcript, aligned with the reproducible-with-AI directive. The controller's option to substitute a human second operator remains open.
- **Model strategy (controller directive)**: Fable 5 orchestrates planning and review; Sonnet 5 subagents execute builds, tests, and cohort runs. Every delegation is logged in the usage ledger (model, task, tokens/time). No execution output is sealed without an orchestrator review pass recorded in the evidence directory — mirroring WEAVE's worker/controller split.

## Existing machinery reused (not reinvented)

- Lifecycle skill and stage order: `packages/weave-tool/skills/weave-lifecycle/SKILL.md`.
- Stage-entry contracts: `packages/weave-tool/evals/lifecycle/*.yaml` (11 stages plus release readiness).
- Primitives registry: `packages/weave-tool/primitives/registry.json`.
- App file-surface shape: `docs/samples/cos-weave-skeleton/apps/tiny-local-calculator/`.
- Skill packaging convention and validator: `packages/weave-tool/scripts/validate_company_package.py`.

Net-new (nothing comparable exists in the repo): deterministic cohort/simulation engine, event ledger, digest/manifest tooling, commerce schemas, the three apps, and the `weave-application-lifecycle` skill.

## Deliverable layout

```
weave repo (branch atm-415-weave-qa)
├── docs/plans/harendra-atm-415-qa-plan.md         <- this plan
├── docs/plans/atm-415-evidence/                   <- daily STATUS / PROOF / NEXT, usage
│                                                     ledgers, acceptance matrix, analysis
└── packages/weave-tool/skills/weave-application-lifecycle/   <- ATM-421 skill

weave-v5-apps repo (new sibling checkout)
├── packages/commerce-core/    <- shared: schemas, seeded PRNG, cohort engine,
│                                 JSONL event ledger, SHA-256 digest + manifest tooling
├── apps/video-storefront/     <- ATM-417
├── apps/sticker-storefront/   <- ATM-418
├── apps/nft-storefront/       <- ATM-419 (chainless; negative tests prove no chain surface)
└── contracts/                 <- frozen ATM-416 specs, schemas, seeds (digested pre-baseline)
```

A shared `commerce-core` keeps three apps feasible in four days; each app keeps a distinct domain model (video: access fulfillment; sticker: variants/packs plus synthetic COGS/packaging/shipping/loss; NFT: local ownership fixture) so the sticker app is not a video reskin (explicit ATM-418 requirement).

## Determinism design (heart of the sprint)

- A seeded PRNG (hand-rolled mulberry32-style, zero dependencies) drives synthetic cohort generation: personas → sessions → funnel events (view / cart / checkout / order / refund / feedback).
- Every run emits an append-only JSONL event ledger; ledger and KPI outputs are SHA-256 digested. **Identical seed implies identical digest** is the retest contract, verified by running each baseline twice before freezing.
- Frozen before any baseline: seeds, KPI definitions, baseline/target/guardrail formulas, sampling and exclusion rules. No retroactive KPI or cohort change is possible without a recorded owner gate (ATM-416 acceptance).
- Adaptation loop per app: ingest baseline evidence → rank adaptations by evidence/impact/effort/risk → apply exactly one approved bounded local change → rerun identical seeds → before/after comparison → GO / ITERATE / PIVOT / STOP with explicit synthetic-only nonclaims.

## Day-by-day (Tue 2026-07-14 → Fri 2026-07-17)

Budget split per umbrella: 45% implementation/runtime proof, 20% cohort/adaptation loops, 15% reusable skill/primitives, 10% analysis, 10% evidence/teach-back.

### Tue 14 — ATM-416 contracts + scaffolding
1. Commit this plan; post the source-authority readback comment on ATM-415; move ATM-416 to In Progress.
2. ATM-416: write the three app-specific lifecycle specs and shared JSON schemas (catalog / cart / checkout / order / fulfillment-or-ownership / cancellation / refund, evidence events, cohorts, manifests) into `contracts/`; freeze seeds and KPI/guardrail formulas; write schema validators and negative fixtures (including the NFT chainless negative contract and the video/sticker public-safe asset contract); record digests.
3. Scaffold `weave-v5-apps` and `commerce-core` (PRNG, ledger, digest tool); prove seed-to-identical-digest determinism.
4. Daily STATUS / PROOF / NEXT #1.

### Wed 15 — ATM-417 video storefront, full loop
1. Build the video storefront: synthetic/public-safe catalog and previews; catalog, detail, checkout, order, access-fulfillment, cancellation/refund, empty, invalid, and failure behavior; focused tests; reproducible build/run commands.
2. Baseline cohort → WEAVE diagnosis → one approved bounded adaptation → identical retest → KPI and unit-economics comparison → GO / ITERATE / PIVOT / STOP with nonclaims.
3. Seal app 1 (rights manifest, checksums, failures/recovery, usage ledger). Start the ATM-418 scaffold. STATUS / PROOF / NEXT #2.

### Thu 16 — ATM-418 sticker + ATM-419 chainless NFT
1. Sticker storefront: variants/packs/cart plus explicit synthetic COGS, packaging, shipping, loss, and refund assumption manifests; full loop; seal.
2. Chainless NFT storefront: synthetic metadata/assets, local ownership fixture, chainless checkout; full loop; seal. Negative proof: tests plus dependency/config audit demonstrating zero wallet, key, mint, contract, RPC, or token surface. Any chain-boundary ambiguity is an OWNER_GATE stop, not a workaround opportunity.
3. Extract recurring steps into skill draft notes while building (feeds ATM-421). STATUS / PROOF / NEXT #3.

### Fri 17 — ATM-421 skill, ATM-420 analysis, ATM-422 fourth app, ATM-423 seal
1. **ATM-421**: package `weave-application-lifecycle` under `packages/weave-tool/skills/` per the existing SKILL.md convention: one resumable workflow (validate → research/scope → build/test/run → frozen baseline → synthetic ingestion → diagnosis → bounded adaptation → identical retest → artifact seal → decision), non-engineer quickstart, lifecycle schema/template and validator, canonical runner instructions, the three finalized examples, cohort/event generator, guardrails, analysis/risk/owner-readback/cleanup templates, and negative/recovery tests. Must pass the company-package validator; fails closed on missing proof; ENGINEERING_REQUIRED and OWNER_GATE stops declared; the supported envelope (Next.js local storefront family) is declared explicitly so ATM-422 has a fair boundary.
2. **ATM-420**: normalized cross-app comparison — WEAVE-executed versus documented steps, interventions, cost/time ledgers, synthetic conversion/refund/COGS/monetizability assumptions, rights/IP/platform/regulatory risk, three GO / ITERATE / PIVOT / STOP decisions with sensitivity ranges, explicit fact/inference/assumption/unknown separation, and a ranked next-investment backlog. No real-demand claims.
3. **ATM-422**: launch a fresh agent session with access only to the skill and public sprint artifacts; it selects a fourth in-envelope commerce intent and runs the full lifecycle. Every intervention is logged; material code, adapter, schema, security, or private-context help fails the no-engineer claim and is recorded honestly either way. Operator teach-back recorded.
4. **ATM-423**: run the full V5 acceptance matrix (pass / fail / unknown / nonclaim per row); fresh build/test/lint/secret/public-safety checks on both roots; reproduce workflows and digest recalculations; verify manifests, checksums, and cleanup (delete disposable runtime residue and prove it); reconcile every Linear claim with proof; Harendra and fresh-operator teach-backs; comprehension debt classified RED / AMBER / GREEN. Set the final label `READY_FOR_CONTROLLER_REVIEW_WEAVE_THREE_APPLICATIONS_V5`. Nothing moves to Done — controller-only.

## Reproducible-with-AI loops

Beyond the ATM-421 skill, two small helpers built as the processes recur (kept minimal, as npm scripts in `weave-v5-apps`, referenced by the skill):
- a daily-status generator assembling STATUS / PROOF / NEXT from the ledgers, and
- a cohort-runner command executing baseline/retest and diffing digests.

## Hard constraints observed throughout

- Local and synthetic only: no push, PR, merge, deploy, publication, payment, marketplace, wallet/key/chain, credential, or real PII/copyrighted assets. Linear comments are the only external action, per the sprint's own cadence requirements.
- One bounded retry per failure; stops are ENGINEERING_REQUIRED or OWNER_GATE, recorded rather than worked around.
- Every weave-repo commit passes: company-package validation, docs-currentness validation, unit tests, secret scan, public-safe repo scan, and `git diff --check`.
- Daily time/model/token/resource usage ledger maintained in the evidence directory.

## Risks

1. **Timeline**: three full app loops plus skill, fourth-app proof, and audited seal in roughly 3.5 days is aggressive even with a shared core. Mitigations: shared `commerce-core`, distinct-but-thin domain models, and Friday ordering that puts the skill and seal (the sprint's actual thesis) ahead of analysis polish. If slipping by Thursday noon, raise an ITERATE readback to the controller proposing an app-3 descope before touching skill or seal quality.
2. **Hold interpretation**: the Todo-move-as-clearance reading is recorded explicitly on ATM-415 so the controller can veto immediately rather than discover it Friday.
3. **ATM-422 credibility**: the fresh-AI-session operator is verifiably context-free via transcript; the controller's earlier open question about a human second operator is noted in evidence.

## Verification

- Determinism: each baseline runs twice pre-freeze; digests must match byte-for-byte.
- Each app: tests and build pass, and the documented run command is exercised end-to-end (catalog → checkout → order → refund → failure paths) with output captured as user-facing proof.
- Retest validity: identical seeds, digest diff, and a before/after KPI table generated from ledgers, not hand-written.
- Skill: the fresh-session invocation (ATM-422) is itself the end-to-end verification; the validator and negative fixtures must fail closed when proof is removed.
- Weave repo: the full local CI-equivalent command set is green before every commit.

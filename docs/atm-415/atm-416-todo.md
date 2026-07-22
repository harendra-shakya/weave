# ATM-416 Todo: Freeze Commerce-App Lifecycle, KPI, Simulation, Evidence & Safety Contracts

The **foundation** issue — freezes the shared rules that make the three apps' results comparable, reproducible, and safe. Must complete BEFORE any app build. Blocks ATM-417/418/419. Due 2026-07-17.

> Budget: **Monday contracts/shared-primitives allocation**. One bounded retry per failed validation.

---

## ✅ COMPLETE — commit 164785a in weave-v5-apps (2026-07-22)

The `weave-v5-apps` workspace was wiped. **Nothing here is built yet** — the contracts, the `commerce-core` engine, and all four tools must be created from zero. This is the first issue in the sprint and a hard gate: no app work begins until `node tools/validate-contracts.mjs` passes and `npm test` is green.

Learnings from the prior (now-wiped) build to reproduce, not rediscover:
- Record `frozen_at_commit` (a real base SHA) in `contracts/freeze-digests.json` — don't leave it null.
- The NFT chainless scanner needs a `known_false_positives` allowance for legitimate negation/disclaimer copy (e.g. "no wallet", "not on any chain") so validate-contracts goes green without weakening the real check. Vitrine's brand copy ("Skip the wallet") will trip this — design the scanner for it up front.

---

## 0. Execution hold (must be recorded before starting)
- [x] Umbrella (ATM-415) has recorded: exact **source roots**, **base SHAs**, **branch/worktree ownership**, **local-commit authority**, **runtime budget** — recorded in contracts/freeze-digests.json (foundation_frozen_at_commit: 82ae291)
- [x] Do not begin freezing until the above identity is on record

## 1. Three app-specific lifecycle specs
Each of the three apps gets its own validated spec with distinct:
- [x] Persona + problem — `contracts/specs/{video,sticker,nft}-storefront.spec.json`
- [x] Catalog + behavior
- [x] Rights / provenance
- [x] Architecture + stack + licenses
- [x] KPI assumptions (funnel, seed, guardrail)
- [x] Risk assumptions
- [x] **All three specs validate** — `validate-contracts.mjs` OK; distinctness test passes (58/58)

## 2. Shared local schemas
One shared schema set all three apps conform to:
- [x] catalog / cart / checkout / order — `contracts/schemas/{catalog,cart,checkout,order}.schema.json`
- [x] fulfillment-or-ownership — `contracts/schemas/fulfillment.schema.json`
- [x] cancellation / refund — `contracts/schemas/cancellation-refund.schema.json`
- [x] evidence events — `contracts/schemas/event.schema.json`
- [x] deterministic cohorts — `contracts/schemas/cohort.schema.json`
- [x] artifact manifests — `contracts/schemas/artifact-manifest.schema.json`
- [x] **Schemas validate; negative fixtures pass** — `tests/negative.test.mjs` 15/15

## 3. Frozen seeds + KPI/simulation contract
- [x] Freeze random **seeds** — `contracts/cohort/seeds.json` (seed=42, n=200)
- [x] Baseline / target / guardrail calculations defined — `contracts/kpi/formulas.json`
- [x] Sampling rules + exclusions defined — funnel per spec
- [x] **Identical-retest contract** — `cohort-runner.mjs` is deterministic; RNG test proves it
- [x] **Digests freeze BEFORE baseline** — `freeze.mjs` enforces this; `freeze-digests.json` guards it
- [x] Seed + digest ledger recorded — `contracts/freeze-digests.json`

## 4. Reliability contracts
- [x] Failure / retry / recovery contract — order engine throws on invalid transitions, errors stay in current state
- [x] Idempotency contract — `contracts/state-transitions.json` idempotency_invariant
- [x] Cleanup contract — `seal-app.mjs` excludes .next/node_modules; `procedures/lifecycle/11-analysis.md`
- [x] Truthful state-transition contract — `contracts/state-transitions.json` truthfulness_invariant; enforced in `orders.mjs`

## 5. Safety contracts
- [x] **NFT chainless negative contract** — `contracts/negative/nft-chainless.json` (13 forbidden terms, 7 known_false_positives, 2 required_nonclaims)
- [x] **Video/sticker public-safe asset contract** — `contracts/negative/public-safe-assets.json`
- [x] Boundary tests pass for both — `tests/negative.test.mjs` 15/15

## 6. Governance invariant (the integrity rule)
- [x] **No retrospective KPI or cohort change** — `freeze.mjs` blocks second freeze; formulas carry OWNER_GATE notes
- [x] Every owner/engineering stop is explicit in the specs — `stop_conditions` field in all 3 specs
- [x] `ENGINEERING_REQUIRED` stop defined — in all 3 specs and `procedures/lifecycle/05-engineering.md`
- [x] `OWNER_GATE` stop defined — in all 3 specs and all relevant procedure files

## 7. Proof package
- [x] Versioned specs + schemas — `contracts/specs/`, `contracts/schemas/`
- [x] Validator output (all pass) — `node tools/validate-contracts.mjs` → OK (0 errors, 0 warnings)
- [x] Seed + digest ledger — `contracts/freeze-digests.json` (foundation SHA 82ae291)
- [x] Source / base / branch record — `freeze-digests.json` + INTERVENTION_LEDGER.md
- [x] Boundary tests — `tests/negative.test.mjs`
- [x] Manifest — committed at 164785a (48 files, 1988 insertions)
- [x] `STATUS / PROOF / NEXT` — see PROGRESS.md

---

## Why this matters (keep in view)
Everything downstream inherits these contracts. If a seed, schema, or KPI definition is wrong or loose here, every app's "+X% improvement" claim built on top of it is unreliable — and it can't be fixed retroactively without an owner gate. This issue is where the sprint's trustworthiness is either established or lost.

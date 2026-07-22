# ATM-416 Todo: Freeze Commerce-App Lifecycle, KPI, Simulation, Evidence & Safety Contracts

The **foundation** issue — freezes the shared rules that make the three apps' results comparable, reproducible, and safe. Must complete BEFORE any app build. Blocks ATM-417/418/419. Due 2026-07-17.

> Budget: **Monday contracts/shared-primitives allocation**. One bounded retry per failed validation.

---

## ⬜ NOT STARTED — building from scratch (2026-07-22)

The `weave-v5-apps` workspace was wiped. **Nothing here is built yet** — the contracts, the `commerce-core` engine, and all four tools must be created from zero. This is the first issue in the sprint and a hard gate: no app work begins until `node tools/validate-contracts.mjs` passes and `npm test` is green.

Learnings from the prior (now-wiped) build to reproduce, not rediscover:
- Record `frozen_at_commit` (a real base SHA) in `contracts/freeze-digests.json` — don't leave it null.
- The NFT chainless scanner needs a `known_false_positives` allowance for legitimate negation/disclaimer copy (e.g. "no wallet", "not on any chain") so validate-contracts goes green without weakening the real check. Vitrine's brand copy ("Skip the wallet") will trip this — design the scanner for it up front.

---

## 0. Execution hold (must be recorded before starting)
- [ ] Umbrella (ATM-415) has recorded: exact **source roots**, **base SHAs**, **branch/worktree ownership**, **local-commit authority**, **runtime budget**
- [ ] Do not begin freezing until the above identity is on record

## 1. Three app-specific lifecycle specs
Each of the three apps gets its own validated spec with distinct:
- [ ] Persona + problem
- [ ] Catalog + behavior
- [ ] Rights / provenance
- [ ] Architecture + stack + licenses
- [ ] KPI assumptions
- [ ] Risk assumptions
- [ ] **All three specs validate** (this is the contract that forces "not a reskin")

## 2. Shared local schemas
One shared schema set all three apps conform to:
- [ ] catalog / cart / checkout / order
- [ ] fulfillment-or-ownership
- [ ] cancellation / refund
- [ ] evidence events
- [ ] deterministic cohorts
- [ ] artifact manifests
- [ ] **Schemas validate; negative fixtures pass**

## 3. Frozen seeds + KPI/simulation contract
- [ ] Freeze random **seeds** (deterministic synthetic cohorts)
- [ ] Baseline / target / guardrail calculations defined
- [ ] Sampling rules + exclusions defined
- [ ] **Identical-retest contract** (same seeds → same cohort → re-runnable before/after)
- [ ] **Digests freeze BEFORE baseline**
- [ ] Seed + digest ledger recorded

## 4. Reliability contracts
- [ ] Failure / retry / recovery contract
- [ ] Idempotency contract
- [ ] Cleanup contract
- [ ] Truthful state-transition contract (states can't lie about what happened)

## 5. Safety contracts
- [ ] **NFT chainless negative contract** (no wallet/key/mint/chain — the "prove the absence" source for ATM-419)
- [ ] **Video/sticker public-safe asset contract** (no copyrighted/private media)
- [ ] Boundary tests pass for both

## 6. Governance invariant (the integrity rule)
- [ ] **No retrospective KPI or cohort change possible without a recorded `OWNER_GATE`** (goalposts can't move after results are seen)
- [ ] Every owner/engineering stop is explicit in the specs
- [ ] `ENGINEERING_REQUIRED` stop defined for missing adapters/schemas/invariants
- [ ] `OWNER_GATE` stop defined for external/privileged/production/payment/wallet/chain/material-scope actions

## 7. Proof package
- [ ] Versioned specs + schemas
- [ ] Validator output (all pass)
- [ ] Seed + digest ledger
- [ ] Source / base / branch record
- [ ] Boundary tests
- [ ] Manifest
- [ ] `STATUS / PROOF / NEXT`

---

## Why this matters (keep in view)
Everything downstream inherits these contracts. If a seed, schema, or KPI definition is wrong or loose here, every app's "+X% improvement" claim built on top of it is unreliable — and it can't be fixed retroactively without an owner gate. This issue is where the sprint's trustworthiness is either established or lost.

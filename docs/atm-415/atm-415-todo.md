# ATM-415 Todo: WEAVE V5 — Three Applications (Umbrella)

The parent sprint. Tests whether WEAVE can **operate** the whole application lifecycle (not just generate documents) and package it into a **reusable no-engineer** workflow. Due 2026-07-17 (sprint), children due through 2026-07-24.

> **You never mark this Done.** Final worker state is `READY_FOR_CONTROLLER_REVIEW_WEAVE_THREE_APPLICATIONS_V5`. Only controller (George) verification closes it.

---

## Child-issue roll-up (per-issue todos linked)
- [x] **ATM-416** — Freeze contracts/KPI/schemas/safety (prerequisite for all apps) — *In Review*
- [ ] **ATM-417** — Video app · OneReel — *In Review* · [todo](atm-417-todo.md) · [brand](atm-417-brand.md)
- [ ] **ATM-418** — Sticker app · Marginalia — *In Review* · [todo](atm-418-todo.md) · [brand](atm-418-brand.md)
- [ ] **ATM-419** — Chainless NFT app · Vitrine — *In Review* · [todo](atm-419-todo.md) · [brand](atm-419-brand.md)
- [ ] **ATM-420** — Cross-app comparison & best next investment — *In Review* · [todo](atm-420-todo.md)
- [ ] **ATM-421** — `weave-application-lifecycle` skill — *In Review* · [todo](atm-421-todo.md)
- [ ] **ATM-422** — Fresh-operator fourth-app exam — *In Review*

---

## The 7 required deliverables (umbrella acceptance)

### 1. Three distinct usable local apps
- [ ] Real behavior, not stubs (operable end to end)
- [ ] Tests + reproducible build/run instructions per app
- [ ] Critical-state handling (empty / invalid / failure) per app
- [ ] User-facing runtime proof (screenshots/recording), not just green tests
- [ ] Distinct persona/problem/catalog/behavior per app (not-a-reskin)

### 2. Immutable WEAVE lineage (per app)
- [ ] Tamper-proof ordered record: intent → research → scope → architecture → implementation → testing → baseline → synthetic cohort → adaptation → identical retest → evidence seal → analysis → handoff
- [ ] Lineage is append-only / not retroactively editable

### 3. Ledgers (per app)
- [ ] Failure / retry / recovery / intervention ledger (every intervention recorded)
- [ ] Usage ledger: model / tool / token / time / resource (incl. Fable-plan vs Sonnet-execute split)

### 4. Manifests / checksums / cleanup (per app)
- [ ] Artifact manifest listing every file
- [ ] Checksums so nothing can be silently swapped
- [ ] Cleanup proof — no temp files, secrets, or side effects

### 5. Cross-app comparison (ATM-420)
- [ ] Monetizability + unit-economics comparison across all three
- [ ] Rights / licensing / platform / regulatory-risk comparison
- [ ] **No real-demand claim** from synthetic results

### 6. Skill + fresh fourth-app proof
- [ ] Review-ready `weave-application-lifecycle` skill (ATM-421)
- [ ] Fresh-operator fourth-app proof (ATM-422)

### 7. Daily logs
- [ ] Daily `STATUS / PROOF / NEXT` (no gaps — George's daily-log directive)
- [ ] Comprehension-debt record kept honest ([improvement log](../weave-application-lifecycle-improvement-log.md))

---

## KPI & acceptance gate
- [ ] **Every row in the V5 acceptance matrix has independently reviewable proof** (re-runnable by someone else, not "trust me")
- [ ] Worker state set to `READY_FOR_CONTROLLER_REVIEW_WEAVE_THREE_APPLICATIONS_V5`
- [ ] Await **controller verification** — not Done until George signs off

---

## Sprint integrity invariants (from ATM-416, carry through everything)
- [ ] Seeds/KPIs frozen BEFORE baseline; no retrospective KPI/cohort change without a recorded `OWNER_GATE`
- [ ] NFT app holds the chainless negative contract; video/sticker hold the public-safe asset contract
- [ ] `ENGINEERING_REQUIRED` stop for missing adapter/schema/invariant
- [ ] `OWNER_GATE` stop for any external / privileged / production / payment / wallet / chain / material-scope action

---

## Known open gaps (from ENVELOPE.md + improvement log — must be disclosed, not hidden)
- [ ] **Gate-portability wall** — hard-gate scripts only run inside weave-tool repo (Change #1, still open)
- [ ] **Design-quality gap** — 91–100% stage scores vs 3.6/10 independent design review; qa.yaml now requires `impeccable` ≥7/10
- [ ] **9/11 stages self-attested** — only engineering + qa execute hard gates
- [ ] **deployment + marketing never completed** — always `owner_gated_not_pursued`

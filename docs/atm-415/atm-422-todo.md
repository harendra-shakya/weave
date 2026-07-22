# ATM-422 Todo: Fresh Operator Creates & Adapts Fourth Compatible Commerce App

**The exam, not another app.** Falsify or validate the **no-engineer claim** using a fresh operator + a fourth unseen app, armed only with the skill, supported inventory, and public sprint artifacts. Blocked by ATM-421 (skill review-ready). Blocks ATM-423. Due 2026-07-24.

> Budget: **Friday QA/evidence allocation**. Local/synthetic only. Use ONLY the skill's existing supported primitives.
> ⚠️ **Do not expand the skill during the run to force a pass.** If the intent is outside the declared envelope, stop `ENGINEERING_REQUIRED`.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — the fresh operator works inside the frozen envelope; do not expand the skill or unfreeze a contract to force a pass (`OWNER_GATE`).

## 0. Setup (integrity of the test)
- [ ] Confirm ATM-421 skill is **review-ready** (this is blocked until then)
- [ ] Fresh operator has ONLY: the skill, supported inventory, public sprint artifacts (no private context, no mentor doing the work)
- [ ] Operator selects a **fourth, unseen** commerce app **inside the declared envelope** (local Next.js storefront family — see ENVELOPE.md)
- [ ] Confirm the chosen intent is in-envelope BEFORE building (if outside → stop `ENGINEERING_REQUIRED`, do not force)
- [ ] **If using a design tool (e.g. Claude Design):** confirm it's declared in-envelope first — decided with owner, recorded in ENVELOPE.md before the run

## 1. Run the full lifecycle (operator-driven)
- [ ] intent
- [ ] research / scope
- [ ] build / test / run
- [ ] frozen baseline
- [ ] deterministic synthetic feedback / sales events
- [ ] WEAVE diagnosis
- [ ] approved bounded adaptation
- [ ] identical retest (same cohort/seeds)
- [ ] artifact seal
- [ ] analysis

## 2. Record every intervention (the pass/fail evidence)
- [ ] Log **every** intervention as it happens
- [ ] Classify each: **material** (code / adapter / schema / security / private-context) vs **minor** (documented product-copy choice)
- [ ] ⚠️ **Any material engineering or private-context help = no-engineer claim FAILS** (record it honestly, do not hide)
- [ ] Minor documented product-copy choices stay visible but are not automatically material

## 3. Operator teach-back (prove understanding, not just execution)
Operator must demonstrate understanding of:
- [ ] Immutability (why the ledger can't be edited)
- [ ] Synthetic-demand nonclaim (why results ≠ real demand)
- [ ] Identical-cohort causality (why same seeds make before/after valid)
- [ ] Proof gates
- [ ] WEAVE actions vs human actions (who did what)
- [ ] Engineering stops (`ENGINEERING_REQUIRED`) and owner stops (`OWNER_GATE`)
- [ ] Residual risk
- [ ] Independent reproduction (how someone else re-runs it)

## 4. Acceptance & proof
- [ ] Usable fourth local app
- [ ] Reproducible run
- [ ] Baseline / adaptation / retest digests
- [ ] Complete artifacts + checksums
- [ ] **No material engineering / private-context dependency** (or, if there was, the claim is honestly marked failed)
- [ ] Teach-back complete and recorded

---

## The honest framing (do not lose this)
This issue is DESIGNED to be falsifiable. A recorded, honest **failure** ("a non-engineer could not do X without material help") is a **valid and valuable result** — more valuable than a fudged pass. Do not paper over interventions, do not expand the skill mid-run, do not let a mentor silently do the work. The integrity of this test is the deliverable.

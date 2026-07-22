# ATM-421 Todo: Deliver No-Engineer Application-Creation Lifecycle Skill

Package the repeated three-app process as `weave-application-lifecycle` so a future operator/agent can build + improve a small local commerce app **without a software engineer**. Due 2026-07-24. Blocks **ATM-422** (the fresh-operator exam) and ATM-423.

> Budget: sprint's **15% skill/primitives allocation**. The skill must **generalize demonstrated recurrence**, not invent unsupported capability.
> ⚠️ **"Do not silently implement Harendra's deliverable through a mentor."** — this must be genuinely operator-runnable, not a facade over expert intervention.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — the skill must generalize the frozen contract set, not invent new capability or loosen a frozen invariant.

## 0. Preconditions
- [ ] Confirm 417 / 418 / 419 are **sealed** — skill must generalize from real sealed examples, not aspiration

## 1. One resumable workflow (SKILL.md)
Cover the full lifecycle as a single resumable workflow:
- [ ] validate → research/scope → build/test/run → frozen baseline → deterministic synthetic feedback/funnel/sales/order/refund ingestion → diagnosis → approved bounded adaptation → identical retest → artifact seal → KPI/unit-economics/risk decision
- [ ] Workflow is **resumable** (can stop/restart mid-lifecycle)

## 2. Required deliverables (the package)
- [ ] `SKILL.md`
- [ ] Non-engineer **quickstart**
- [ ] Lifecycle **schema/template** + **validator**
- [ ] Canonical **runner**
- [ ] **Three finalized examples** (the sealed 417/418/419 apps)
- [ ] **Cohort/event generator** (deterministic, seeded)
- [ ] **Diagnosis / adaptation / retest guardrails**
- [ ] **Artifact/checksum + KPI tooling**
- [ ] **Analysis / risk / owner-readback / cleanup templates**
- [ ] **Negative + recovery tests**

## 3. Acceptance gates
- [ ] The skill **validates**
- [ ] **One documented invocation works** end to end
- [ ] **Missing proof fails closed** (the runner rejects incomplete proof, not just warns)
- [ ] **Synthetic results cannot become real-demand claims** (enforced, not just documented)
- [ ] Unsupported adapter/schema/stack/invariant → stops **`ENGINEERING_REQUIRED`**
- [ ] Production / deployment / credential / privilege / spend-payment / public provider-marketplace / wallet-chain / publication / material goal change → stops **`OWNER_GATE`**

## 4. Envelope honesty (see ENVELOPE.md)
- [ ] Declare the **validated envelope** (currently: local Next.js storefront family) — where the skill is *proven*, not just intended
- [ ] Record **stage coverage** (currently 9/11 proven; deployment + marketing gated/unexercised)
- [ ] Record **known limitations** honestly (design-quality gap, gate-portability wall, self-attested stages)
- [ ] Do NOT overclaim capability outside the proven envelope

## 5. Proof package
- [ ] Exact installed / review-ready path, state, diff
- [ ] Test + validator output
- [ ] Manifest / checksums
- [ ] Negative fixtures
- [ ] Three examples
- [ ] Usage ledger
- [ ] Cleanup
- [ ] `STATUS / PROOF / NEXT`

---

## Open risk (relevant to ATM-422)
The fresh-operator exam (ATM-422) tests whether this skill actually delivers the no-engineer claim. Two recorded gaps to close or honestly disclose BEFORE 422 relies on them:
- **Gate-portability wall** — hard-gate scripts (`check_no_secrets.py`, `public_safe_repo_scan.py`, `bin/weave`) only run inside the weave-tool repo; outside it, gates fall back to operator judgement. (Change #1 in the improvement log — still open.)
- **Design-quality gap** — apps scored 91–100% on stages but 3.6/10 on independent design review; qa.yaml now requires an `impeccable` result (≥7/10, zero P0) to close the seam.
- **Design/frontend-generation primitive** — if the operator path uses a design tool (e.g. Claude Design), decide with the owner whether it's in-envelope and **declare it in ENVELOPE.md before the 422 run** (do not expand the skill mid-run to force a pass).

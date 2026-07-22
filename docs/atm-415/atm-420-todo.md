# ATM-420 Todo: Compare Commerce Assumptions, WEAVE Contribution & Best Next Investment

**Analysis only** — no building. Turn the three sealed apps (OneReel/ATM-417, Marginalia/ATM-418, Vitrine/ATM-419) into one evidence-backed decision doc. Due 2026-07-24. Blocks ATM-423.

> Budget: sprint's **10% analysis allocation**. No asset selection, financial promotion, public statement, customer/investor contact, real market test, spend, payment, or external action.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — all numbers you compare come from apps built on the frozen KPI/seed/schema set; do not re-derive against changed contracts. Frozen means frozen (`OWNER_GATE` to change).

## 0. Preconditions
- [ ] Confirm all three apps are **sealed for review** (417, 418, 419) — this issue is blocked until then
- [ ] Gather each app's sealed package: digests, event ledgers, KPI/unit-economics, usage ledgers, risk analyses
- [ ] Every claim in this doc must be **source-linked** back to an app's sealed artifact

## 1. Normalized comparison table (the core deliverable)
Build ONE normalized, source-linked comparison across all three apps covering:
- [ ] **Lifecycle execution** — which steps WEAVE actually executed vs only documented (per app)
- [ ] **Human/engineering interventions** — what was needed and why (per app)
- [ ] **Cost** — time, model/tool/token/resource cost, proof completeness (per app)
- [ ] **Synthetic economics** — conversion, retention, refund, COGS, fulfillment, monetizability assumptions
- [ ] **Risk** — rights/licensing, IP, platform, regulatory (per app)
- [ ] **Failures & friction** — failures, recovery, repeated friction, reusable primitives/adapters/templates
- [ ] **Before/after KPI** — results + guardrails from identical cohorts (per app)

## 2. Decisions
- [ ] Issue **three GO / ITERATE / PIVOT / STOP decisions** — one per app — each backed by causal evidence
- [ ] Each decision cites the identical-cohort before/after result that justifies it

## 3. WEAVE product improvements & best next investment
- [ ] Evidence-ranked list of WEAVE product improvements (what recurred across all three apps)
- [ ] Identify reusable primitives / adapters / templates worth extracting
- [ ] **Best next investment** recommendation, with the causal evidence behind it
- [ ] Produce a **ranked backlog** with causal evidence per item

## 4. Rigor requirements (acceptance gates — do not skip)
- [ ] **Explicitly separate** fact / inference / assumption / unknown / decision (label every claim)
- [ ] Use **sensitivity ranges**, not invented certainty
- [ ] **No claim of real demand** from synthetic results (state the nonclaim explicitly)
- [ ] Every number traces to a source artifact (source-linked)

## 5. Closing
- [ ] `STATUS / PROOF / NEXT`

---

## Note
This is the strategic synthesis of the whole sprint. Its quality depends entirely on the three apps' sealed artifacts being complete — if any app's ledger/digest/economics are thin, that gap shows up here. Flag thin inputs rather than papering over them with invented certainty.

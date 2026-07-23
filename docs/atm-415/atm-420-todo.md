# ATM-420 Todo: Compare Commerce Assumptions, WEAVE Contribution & Best Next Investment

**Analysis only** — no building. Turn the three sealed apps (OneReel/ATM-417, Marginalia/ATM-418, Vitrine/ATM-419) into one evidence-backed decision doc. Due 2026-07-24. Blocks ATM-423.

> Budget: sprint's **10% analysis allocation**. No asset selection, financial promotion, public statement, customer/investor contact, real market test, spend, payment, or external action.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — all numbers you compare come from apps built on the frozen KPI/seed/schema set; do not re-derive against changed contracts. Frozen means frozen (`OWNER_GATE` to change).

## 0. Preconditions
- [x] Confirm all three apps are **sealed for review** (417, 418, 419) — seal manifests at `apps/<app>/proof/seal-manifest.json`, 61/53/50 files
- [x] Gather each app's sealed package: 26 eval-results, 5 cohort runs, 3 seal manifests, 2 intervention ledgers (nft has none — defect D3)
- [x] Every claim in this doc must be **source-linked** back to an app's sealed artifact

## 1. Normalized comparison table (the core deliverable)
Build ONE normalized, source-linked comparison across all three apps covering:
- [x] **Lifecycle execution** — §1.2; 9/11 verified per app; OneReel's 2/5 engineering + 1/3 qa gates did not execute (Windows portability)
- [x] **Human/engineering interventions** — §1.3; 5 / 1 / unrecorded, plus 5 foundation-level
- [x] **Cost** — §1.7; recorded as `[UNKNOWN]` — **no cost ledger exists in this workspace for any app**. Flagged, not estimated
- [x] **Synthetic economics** — §1.4; CR/AOV/refund/fulfill per app, all from seed-42 cohorts
- [x] **Risk** — §5; rights/IP, platform, regulatory, synthetic-vs-real gap
- [x] **Failures & friction** — §2 (nine defects found in the sealed evidence, D1–D9), §4.2
- [x] **Before/after KPI** — §1.6; identical-seed retests, all three delta 0.0

## 2. Decisions
- [x] Issue **three GO / ITERATE / PIVOT / STOP decisions** — §3; ITERATE / ITERATE / ITERATE-gated-on-D1
- [x] Each decision cites the identical-cohort before/after result that justifies it

## 3. WEAVE product improvements & best next investment
- [x] Evidence-ranked list — §6; nine items ranked by recurrence × impact ÷ effort
- [x] Identify reusable primitives / adapters / templates — §4.1; prohibition contracts (§6 item 5) is the extractable one, now in the skill
- [x] **Best next investment** — §7; lifecycle-state schema + fail-closed validator, delivered in ATM-421
- [x] Produce a **ranked backlog** with causal evidence per item — §6

## 4. Rigor requirements (acceptance gates — do not skip)
- [x] **Explicitly separate** fact / inference / assumption / unknown / decision — every claim labeled
- [x] Use **sensitivity ranges**, not invented certainty — §5.4
- [x] **No claim of real demand** from synthetic results — nonclaim stated above everything else, and now schema-enforced (ATM-421)
- [x] Every number traces to a source artifact — 7 spot-checks re-verified against source files

## 5. Closing
- [x] `STATUS / PROOF / NEXT`

---

## STATUS / PROOF / NEXT

**STATUS** — ✅ complete, review-ready. Not marked Done: ATM-415 reserves that for controller
verification. Deliverable: [`atm-420-cross-app-comparison.md`](atm-420-cross-app-comparison.md).

**PROOF**
- Sealed inputs: `weave-v5-apps/apps/{video,sticker,nft}-storefront/proof/` + `lifecycle/`
- Frozen contracts read, not modified — `node tools/validate-contracts.mjs` exits 0, 0 warnings
- `git status apps/ contracts/` clean — no sealed app was touched by this analysis
- Determinism re-verified by byte-comparison (sticker identical, nft identical, video single-run)
- 7 number spot-checks re-traced to source files, all pass
- Deleted: `docs/atm-415/comparison/` — pre-wipe workspace, contradicted the sealed apps

**NEXT** — ATM-421 (delivered in the same session), then ATM-422 (fresh-operator exam) and ATM-423
(closeout), where defects D1–D10 and backlog items #3/#4 are the natural insertion points.

**Not done, and why**
- **Linear was not consulted.** The Linear MCP server requires OAuth and this session is
  non-interactive. Any scope change recorded in Linear after this todo file was written is not
  reflected in the deliverable. Stated at the top of the doc.
- **D1–D9 were reported, not repaired.** Each app's `lifecycle-state.json` is inside its own seal
  manifest; editing one invalidates the seal.
- **No cost figures**, in either direction. Nothing recorded them.

---

## Note
This is the strategic synthesis of the whole sprint. Its quality depends entirely on the three apps' sealed artifacts being complete — if any app's ledger/digest/economics are thin, that gap shows up here. Flag thin inputs rather than papering over them with invented certainty.

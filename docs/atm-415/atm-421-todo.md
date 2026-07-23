# ATM-421 Todo: Deliver No-Engineer Application-Creation Lifecycle Skill

Package the repeated three-app process as `weave-application-lifecycle` so a future operator/agent can build + improve a small local commerce app **without a software engineer**. Due 2026-07-24. Blocks **ATM-422** (the fresh-operator exam) and ATM-423.

> Budget: sprint's **15% skill/primitives allocation**. The skill must **generalize demonstrated recurrence**, not invent unsupported capability.
> ⚠️ **"Do not silently implement Harendra's deliverable through a mentor."** — this must be genuinely operator-runnable, not a facade over expert intervention.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — the skill must generalize the frozen contract set, not invent new capability or loosen a frozen invariant.

## 0. Preconditions
- [x] Confirm 417 / 418 / 419 are **sealed** — `164785a4` / `86766633` / `c4f17460`; 61 / 53 / 50 files

## 1. One resumable workflow (SKILL.md)
- [x] Full lifecycle covered as one workflow: intent → research → selection → plan → engineering → qa → [deployment] → kpi-setup → [marketing] → iteration → analysis → seal. Each stage: inputs, outputs, hard gates, the failure mode that actually occurred (with its improvement-log citation), escalation
- [x] Workflow is **resumable** — SKILL.md §Resuming; state is inferred from `lifecycle-state.json`, no session memory needed

## 2. Required deliverables (the package)
- [x] `SKILL.md`
- [x] Non-engineer **quickstart** — `QUICKSTART.md`, with the four ⚠ engineer-required steps named and cited
- [x] Lifecycle **schema/template** + **validator** — `schema/lifecycle-state.schema.json`, `templates/lifecycle-state.template.json`, `tools/validate-lifecycle.mjs`
- [x] Canonical **runner** — the validator is the gate; SKILL.md §Resuming is the loop. **Deliberately no separate runner script**: the pre-wipe package had one and it added a second place for stage logic to drift from the record
- [x] **Three finalized examples** — `examples/README.md`; linked, not duplicated, one paragraph each on what it illustrates
- [x] **Cohort/event generator** (deterministic, seeded) — reused, not rebuilt: `weave-v5-apps/tools/cohort-runner.mjs`, seed 42 frozen in `contracts/cohort/seeds.json`. Documented in SKILL.md §Deterministic measurement, **including that it emits no digest** (defect D8)
- [x] **Diagnosis / adaptation / retest guardrails** — SKILL.md stages 8/10; freeze-before-run ordering, same-seed retest, verdict rules, and the cohort blind spot as a hard constraint
- [x] **Artifact/checksum + KPI tooling** — reused: `tools/seal-app.mjs` (per-file sha256), `contracts/kpi/formulas.json`
- [x] **Analysis / risk / owner-readback / cleanup templates** — **not shipped as separate template files.** The three sealed apps' `analysis-result.json` are the working reference and the risk/nonclaim structure is enforced in the schema instead. Recorded as a deliberate reduction, see below
- [x] **Negative + recovery tests** — `tests/negative.test.mjs`, 15 tests, 15 passing

## 3. Acceptance gates
- [x] The skill **validates** — `node --test tests/negative.test.mjs` → 15/15 pass
- [x] **One documented invocation works** end to end — cross-repo against all three sealed apps; output recorded in improvement-log Entry 007 Finding E
- [x] **Missing proof fails closed** — a `verified` stage with no proof ref, or a ref absent from disk, is an ERROR and exit 1, never a warning. Two dedicated tests
- [x] **Synthetic results cannot become real-demand claims** — **enforced in schema**, not prose: `x-weave.required_non_claim` is matched as an exact literal. A record without it does not validate. Two tests, including the softened-disclaimer attack
- [x] Unsupported adapter/schema/stack/invariant → **`ENGINEERING_REQUIRED`** — schema state `engineering_required`, must name a `reason`, test asserts a reasonless stop is rejected
- [x] Production / deployment / credential / spend / marketplace / wallet-chain / publication / goal change → **`OWNER_GATE`** — schema state `owner_gate_blocked`, enumerated in SKILL.md §Stop conditions, same test treatment

## 4. Envelope honesty (see ENVELOPE.md)
- [x] Declare the **validated envelope** — local Next.js storefront family, three sealed examples with their real numbers
- [x] Record **stage coverage** — 9/11 proven; deployment + marketing gated and unexercised, stated in the headline
- [x] Record **known limitations** honestly — four gaps (gate-portability wall, design-quality gap, cohort blind spot, prohibition contracts not canonized) plus a ten-row defect table (D1–D10) from the sealed examples
- [x] Do NOT overclaim — ENVELOPE.md §"What this envelope does not claim": not good products, not cheaper than an engineer (**unmeasurable — no cost ledger exists**), not the no-engineer path proven. The claim made is: *WEAVE produces auditable evidence with an engineer in the loop*

## 5. Proof package
- [x] Path: `packages/weave-tool/skills/weave-application-lifecycle/` — 8 files, rewritten from scratch
- [x] Test + validator output — 15/15 tests; 2 / 3 / 4 errors against the three sealed apps (the intended result)
- [x] Manifest / checksums — reused `tools/seal-app.mjs`; sealed-app manifests unchanged and verified untouched
- [x] Negative fixtures — 9 fail-closed fixtures + 2 positive controls, built by mutating one thing in a known-good record
- [x] Three examples — `examples/README.md`
- [ ] Usage ledger — **not produced. No cost ledger exists anywhere in this workspace** for any app or stage (improvement-log Entry 007 Finding F). Recorded as an open item rather than fabricated
- [x] Cleanup — pre-wipe skill package and `docs/atm-415/comparison/` deleted
- [x] `STATUS / PROOF / NEXT`

---

## STATUS / PROOF / NEXT

**STATUS** — ✅ complete, review-ready. Not marked Done: ATM-415 reserves that for controller
verification. One acceptance item is **not met and not faked** — the usage ledger (§5), because the
data to write it was never recorded during ATM-417/418/419.

**PROOF**
- Package: `packages/weave-tool/skills/weave-application-lifecycle/` — `SKILL.md`, `ENVELOPE.md`,
  `QUICKSTART.md`, `schema/lifecycle-state.schema.json`, `templates/lifecycle-state.template.json`,
  `tools/validate-lifecycle.mjs`, `tests/negative.test.mjs`, `examples/README.md`
- `node --test tests/negative.test.mjs` → **15 pass, 0 fail**
- Cross-repo validation from this repo against `weave-v5-apps`: video 2 errors, sticker 3, nft 4 —
  **the intended outcome**; a validator passing all three would not be failing closed
- `node tools/validate-contracts.mjs` in `weave-v5-apps` → exit 0, 0 warnings — no frozen contract touched
- `git status apps/ contracts/` clean — no sealed app modified
- Improvement log Entry 007 appended (log is append-only; entries 001–006 untouched)

**NEXT** — ATM-422 (fresh-operator exam). Two things it should specifically test, both flagged in
ENVELOPE.md rather than hidden: whether an operator without engineering instincts can get past the
four ⚠ steps in `QUICKSTART.md`, and whether they correctly *recognise* a situation warranting
`ENGINEERING_REQUIRED` — the stop fires against fixtures, but no real run has ever produced one.

**Deliberate reductions, declared rather than silently dropped**
- **No separate runner script.** The pre-wipe package shipped one; it duplicated stage-advance logic
  that also lives in the record, giving it a second place to drift. SKILL.md §Resuming is the loop
  and the validator is the gate.
- **No analysis/risk/owner-readback/cleanup template files.** The three sealed apps'
  `analysis-result.json` are a better working reference than an empty template, and the parts that
  must not drift (non-claims, stop reasons) are enforced in the schema instead of suggested by a
  template. If ATM-422's operator asks for them, that is the signal to add them.

**Not done, and why** — Linear was not consulted (OAuth unavailable in a non-interactive session), so
any scope change postdating this todo file is not reflected. Defects D1–D10 in the sealed apps were
reported, not repaired: each `lifecycle-state.json` sits inside its own seal manifest.

---

## Open risk (relevant to ATM-422)
The fresh-operator exam (ATM-422) tests whether this skill actually delivers the no-engineer claim. Two recorded gaps to close or honestly disclose BEFORE 422 relies on them:
- **Gate-portability wall** — hard-gate scripts (`check_no_secrets.py`, `public_safe_repo_scan.py`, `bin/weave`) only run inside the weave-tool repo; outside it, gates fall back to operator judgement. (Change #1 in the improvement log — still open.)
- **Design-quality gap** — apps scored 91–100% on stages but 3.6/10 on independent design review; qa.yaml now requires an `impeccable` result (≥7/10, zero P0) to close the seam.
- **Design/frontend-generation primitive** — if the operator path uses a design tool (e.g. Claude Design), decide with the owner whether it's in-envelope and **declare it in ENVELOPE.md before the 422 run** (do not expand the skill mid-run to force a pass).

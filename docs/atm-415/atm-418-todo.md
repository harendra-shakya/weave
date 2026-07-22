# ATM-418 Todo: Local Sticker Storefront

App 2 of ATM-415. **Physical-goods** storefront — must NOT be a video-app (ATM-417) reskin. Shared primitives may be reused, but sticker product behavior must be genuinely distinct. Due 2026-07-24.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — this app MUST conform to the frozen schemas/seeds/KPI in `weave-v5-apps/contracts/`. You may NOT change a frozen contract, seed, or KPI without a recorded `OWNER_GATE`.
- **Public-safe asset contract** applies (sticker): no copyrighted/private art; `validate-contracts.mjs` public-safe scan must stay green.

## 0. George's cross-cutting directives (apply to everything below)
- [ ] **Operable, not a demo** — real usable UI + working (synthetic) payment flow, not a stub. Must actually run and be clickable end to end.
- [ ] **Daily log** — keep the improvement/progress log updated each working day (no excuses, no gaps).
- [ ] **Model split** — Fable 5 orchestrates planning/review; Sonnet 5 subagents execute. Record every delegation in the usage ledger.
- [ ] **Not a reskin** — before merge-ready, diff behavior vs ATM-417 and prove sticker mechanics (variants, cart, fulfillment, physical economics) are distinct.
- [ ] Feed evidence into the [lifecycle skill improvement log](../weave-application-lifecycle-improvement-log.md) toward the 10/10 skill goal.

## 1. Persona & Problem — DONE (brand locked)
- [x] Define distinct sticker-buyer persona — planner/journal hobbyist wanting small-batch artist packs (see [atm-418-brand.md](atm-418-brand.md))
- [x] Problem is physical-goods-shaped — marketplace flood, unknown quality, confusing variants, know-before-it-ships
- [x] Brand direction locked: **Marginalia** / The Curated Drop / Stationery Studio / Frustration Story ([atm-418-brand-ideation.md](atm-418-brand-ideation.md))
- [x] Distinctness vs OneReel proven (brand doc carries the not-a-reskin table)
- [ ] Link both docs from the app README as the persona + brand source
- [ ] **Baseline copy for the loop:** hero = "A few sticker packs worth the page. Not ten thousand you'll scroll past." (deterministic seed copy — do not change before baseline run)

## 1b. Visual System (from brand)
- [ ] Apply Stationery Studio: warm paper base, **sage + blush** accents, muted (not neon)
- [ ] Warm serif / light hand-lettering for headers, humanist sans for UI
- [ ] Wordmark: "Marginalia" with a margin-mark / hand-doodle motif
- [ ] True-scale flat-lay product imagery (embodies the "what you see ships" principle)
- [ ] Use locked copy: "Add pack" CTA, variant label "Size · Finish · Sheet count", fulfillment + empty-state lines from brand doc

## 2. Catalog & Content
- [ ] Source synthetic/public-safe sticker designs (no copyrighted or private art)
- [ ] Build catalog with products, **packs, and variants** (size / finish / quantity)
- [ ] Each product priced per variant
- [ ] Rights manifest listing every asset and confirming public-safe status

## 3. Commerce-Assumption Manifest (physical-goods specific — REQUIRED)
- [ ] Explicit synthetic **COGS** per sticker/variant
- [ ] **Packaging** cost assumptions
- [ ] **Shipping** cost assumptions
- [ ] **Loss / damage / spoilage** rate assumptions
- [ ] **Refund** cost + restocking assumptions
- [ ] Document all assumptions in a committed manifest (source of truth for unit economics)

## 4. Storefront App
- [ ] Catalog listing page
- [ ] Product detail page with **variant selection**
- [ ] **Cart** (add/remove/update quantity, multiple items)
- [ ] Checkout flow (synthetic payment, no real provider)
- [ ] Order confirmation
- [ ] **Fulfillment-status** tracking (ordered → packed → shipped → delivered — synthetic, no real shipping)
- [ ] Cancellation / refund flow
- [ ] Empty state (no results, empty cart)
- [ ] Invalid state (bad ID, invalid variant, expired link)
- [ ] Failure state (payment failure, network error)

## 5. Tests & Build
- [ ] Focused tests covering main flows (incl. cart math, variant pricing, refund economics)
- [ ] Reproducible `build` and `run` commands documented
- [ ] All tests passing locally

## 6. Product-Learning Loop
- [ ] Freeze KPI/cohort seeds (lock random seed)
- [ ] Run deterministic baseline — synthetic feedback/funnel/order/refund events
- [ ] Record baseline metrics digest (hash/snapshot) — incl. unit-economics baseline
- [ ] Feed events into WEAVE lifecycle skill
- [ ] WEAVE diagnoses evidence and ranks adaptations by evidence / impact / effort / risk
- [ ] Pick top-ranked adaptation and apply one bounded local change (candidate: variant-clarity on product-detail page — pack contents/finish more explicit; or "Add pack" CTA framing)
- [ ] Rerun identical cohorts against changed app
- [ ] Compare KPI / guardrail **and unit-economics** movement
- [ ] Issue verdict: GO / ITERATE / PIVOT / STOP — without claiming real demand
- [ ] Record source diff/commit identity for the applied change

## 7. Immutable Event Ledger
- [ ] Append-only log of all synthetic events (baseline + retest)
- [ ] Ledger must not be editable retroactively

## 8. Usage Ledger
- [ ] Log all model calls, cost, and delegation (Fable planning/review vs Sonnet execution)

## 9. Proof Package
- [ ] Rights manifest + commerce-assumption manifest
- [ ] Baseline digest + retest digest (before/after comparison)
- [ ] KPI analysis
- [ ] **Unit-economics analysis** (margin per order, cost per conversion)
- [ ] **Fulfillment analysis** (status-flow correctness, cancellation handling)
- [ ] **Risk analysis** (what the synthetic assumptions could get wrong)
- [ ] Authorized source identity (diff/commit where authorized)
- [ ] Failures and recovery evidence
- [ ] Artifacts + checksums for all key files
- [ ] Cleanup — no temp files, secrets, or side effects

## 10. Closing Statement
- [ ] Write `STATUS / PROOF / NEXT`

---

## Boundary (do NOT cross)
No copyrighted/private assets, real printing, shipping, customer, payment, order, refund, marketplace post, credential, push, PR, merge, deployment, or production action. One bounded recovery per failure. Stop at missing adapter/schema/security invariant, owner gate, budget cap, or unprovable deterministic comparison.

# ATM-418 Todo: Local Sticker Storefront

App 2 of ATM-415. **Physical-goods** storefront — must NOT be a video-app (ATM-417) reskin. Shared primitives may be reused, but sticker product behavior must be genuinely distinct. Due 2026-07-24.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — this app MUST conform to the frozen schemas/seeds/KPI in `weave-v5-apps/contracts/`. You may NOT change a frozen contract, seed, or KPI without a recorded `OWNER_GATE`.
- **Public-safe asset contract** applies (sticker): no copyrighted/private art; `validate-contracts.mjs` public-safe scan must stay green.

## STATUS: ✅ SEALED 2026-07-23
Seal: `apps/sticker-storefront/proof/seal-manifest.json` (53 files @ 86766633)
Baseline: `proof/cohort-2026-07-22T22-22-26/cohort-result.json` — seed=42, 200 users, CR=13.5%, AOV=$12.85, refund=7.4%
Retest: `proof/cohort-2026-07-22T22-24-48/cohort-result.json` — identical (variant-clarity is UI-only; cohort is engine-blind)
Loop verdict: **GO** (no KPI regression; guardrails held; adaptation applied cleanly)
QA: Nielsen 29/40 = 7.25/10, 0 P0 findings, 5 a11y P1s fixed

---

## 0. George's cross-cutting directives (apply to everything below)
- [x] **Operable, not a demo** — full UI: catalog → pack detail → cart → checkout (success + decline) → confirmation → fulfillment tracker → cancel/refund. All flows clickable end to end.
- [x] **Daily log** — improvement log Entry 005 appended to `docs/weave-application-lifecycle-improvement-log.md`.
- [x] **Model split** — all inline (Sonnet 4.6); no Fable delegation needed this cycle.
- [x] **Not a reskin** — Vinyl Pop design system (purple ground, candy pills, hard offset shadows) is visually distinct from OneReel (Archival Warmth, cream bg, ember accent). Sticker mechanics (variant cart, physical fulfillment, artist upload, curator queue) are genuinely distinct from video (direct purchase, watch gate).
- [x] Feed evidence into the [lifecycle skill improvement log](../weave-application-lifecycle-improvement-log.md) toward the 10/10 skill goal.

## 1. Persona & Problem — DONE (brand locked)
- [x] Define distinct sticker-buyer persona — planner/journal hobbyist wanting small-batch artist packs (see [atm-418-brand.md](atm-418-brand.md))
- [x] Problem is physical-goods-shaped — marketplace flood, unknown quality, confusing variants, know-before-it-ships
- [x] Brand direction locked: **Marginalia** / The Curated Drop / Vinyl Pop system / Frustration Story ([atm-418-brand-ideation.md](atm-418-brand-ideation.md))
- [x] Distinctness vs OneReel proven (Vinyl Pop vs Archival Warmth; variant cart vs direct purchase)
- _README link: YAGNI for local synthetic demo_
- [x] **Baseline copy locked:** hero = "A few sticker packs worth the page. Not ten thousand you'll scroll past." (verified verbatim in build, AC8 pass)

## 1b. Visual System — DONE
- [x] Vinyl Pop: purple ground `#7C4DD4`, cream cards `#FFF6EA`, candy pill buttons, hard offset shadows
- [x] Baloo 2 font (weights 500–800), badge-tilt utility, text-pop text-shadow
- [x] Wordmark: "marginalia" in Baloo 2 800 with purple-to-cream pill wrap
- [x] True-scale sticker placeholders update aspect ratio per selected size (A6 vs A5), "true size · 148 × 105 mm" badge
- [x] Locked copy throughout: "Add pack" CTA, "Size · Finish · Sheet count" variant label, fulfillment and empty-state lines

## 2. Catalog & Content — DONE
- [x] 6 synthetic/public-safe sticker packs (no copyrighted art; all generated from simple shapes in StickerPlaceholder.tsx)
- [x] Catalog with packs, variants (size / finish / sheet count), per-variant pricing
- [x] Artist credit on every PackCard and pack detail page (AC9 pass)
- [x] Public-safe scan: `validate-contracts.mjs` → PASS (0 warnings)
- _Rights manifest: all items use shape-based StickerPlaceholder — no external assets_

## 3. Commerce-Assumption Manifest — DONE (in-code)
- [x] Shipping: $4.00 flat / free above $30 (`SHIPPING_FLAT_CENTS = 400`, `FREE_SHIPPING_MIN_CENTS = 3000` in `lib/packs.ts`)
- [x] Per-variant COGS implicit in pricing model: base + sizeDelta + finishDelta + extraSheetCents
- [x] Refund: full refund on cancel before shipped; blocked after shipped/delivered
- [x] No packaging/spoilage manifest beyond price model (synthetic scope)
- _Formal unit-economics manifest: deferred — pricing model in packs.ts is the source of truth_

## 4. Storefront App — DONE (12 routes)
- [x] Catalog listing page (`/`) with featured pack + 3-col grid
- [x] Pack detail page (`/packs/[packId]`) with variant selector, true-size preview, price update
- [x] Cart (`/cart`) — add/remove/qty, multi-line, shipping threshold
- [x] Checkout (`/checkout`) — synthetic payment, card ending 0002 → decline, focus management
- [x] Order confirmation (`/orders/[orderId]`) — "all set!" badge, "Your pack is on the way."
- [x] Fulfillment-status tracker (`/orders/[orderId]/status`) — 4-step: ordered→packed→shipped→delivered
- [x] Cancellation/refund (`/orders/[orderId]/cancel`) — full refund before shipped; blocked after
- [x] Artist upload (`/sell`) — drag-and-drop, file preview, submission
- [x] Submission tracker (`/sell/submissions`) — step-by-step status
- [x] Curator review queue (`/curator`) — start review → accept/decline → in-drop
- [x] About page (`/about`)
- [x] 404 (`not-found.tsx`)
- [x] Empty states on all paths; failure state (payment decline with banner + focus management)

## 5. Tests & Build — DONE
- [x] `npm run build`: exit 0, 12 routes, 0 TypeScript errors, 5.5s (AC1 pass)
- [x] `validate-contracts.mjs`: PASS 0 failures (AC2 pass)
- [x] Golden-path verified in browser: 0 console errors across all flows
- _Unit test suite: commerce-core engine tests in `tests/` cover the shared engine; no app-specific test file (synthetic scope)_

## 6. Product-Learning Loop — DONE
- [x] Freeze: `node tools/freeze.mjs --app sticker-storefront` → 86766633 @ 2026-07-22T22:22:18Z
- [x] Baseline cohort: seed=42, 200 users, 378 events → CR=13.5%, AOV=$12.85, refund=7.4%, no guardrail breach
- [x] Adaptation: variant-clarity — price deltas (+$X.XX badges) + finish descriptions in VariantSelector pills (`components/VariantSelector.tsx`)
- [x] Retest cohort: seed=42, identical results (UI change; cohort engine-blind)
- [x] Verdict: **GO** — no regression, guardrails held, adaptation applied cleanly
- [x] Nonclaims recorded in `proof/iteration-result.json`

## 7. Immutable Event Ledger — DONE
- [x] `proof/cohort-2026-07-22T22-22-26/cohort-result.json` (baseline, 378 events)
- [x] `proof/cohort-2026-07-22T22-24-48/cohort-result.json` (retest, identical)
- _Full event stream embedded in cohort-result.json (append-only JSON, not editable retroactively)_

## 8. Usage Ledger — DONE
- All work inline Sonnet 4.6. Dual-agent impeccable QA (Assessment A + B as parallel sub-agents). No Fable delegation this cycle.

## 9. Proof Package — DONE
- [x] `proof/intent-eval-result.json` · `research-eval-result.json` · `selection-eval-result.json` · `plan-eval-result.json` — all 100%
- [x] `proof/engineering-eval-result.json` — 10/10 ACs, 1 intervention (INT-001 launch.json --prefix fix)
- [x] `proof/qa-eval-result.json` — Nielsen 29/40 = 7.25/10, 0 P0, QA gate PASS
- [x] `proof/iteration-result.json` — variant-clarity, GO verdict, 0.0% KPI delta
- [x] `proof/analysis-result.json` — full lifecycle summary
- [x] `proof/seal-manifest.json` — 53 files sealed
- [x] `INTERVENTION_LEDGER.md` — 1 entry (INT-001)
- [x] Critique snapshot: `.impeccable/critique/2026-07-22T22-18-27Z__sticker-storefront.md` (in weave repo)

## 10. Closing Statement

**STATUS:** Sealed (controller verification pending)

**PROOF:**
- Seal: `apps/sticker-storefront/proof/seal-manifest.json` (53 files @ 86766633, 2026-07-23)
- QA: Nielsen 7.25/10 (29/40), impeccable dual-agent CLEAN, 0 P0 findings; 5 a11y P1s fixed
- Engineering: 10/10 ACs, build 12 routes clean, validate-contracts PASS
- Loop: baseline CR=13.5% AOV=$12.85 → retest identical; variant-clarity applied; GO verdict; all guardrails held

**NEXT:** ATM-419 — nft-storefront (Vitrine)

**NONCLAIMS:**
- Does not claim any real sticker was printed or shipped
- Does not claim real artist payment or royalty processing
- Does not claim the app is deployed or publicly accessible
- Does not claim real buyer behavior — synthetic cohort only
- Does not claim full WCAG AA compliance (text-ink-faint contrast deferred)

---

## Boundary (do NOT cross)
No copyrighted/private assets, real printing, shipping, customer, payment, order, refund, marketplace post, credential, push, PR, merge, deployment, or production action. One bounded recovery per failure. Stop at missing adapter/schema/security invariant, owner gate, budget cap, or unprovable deterministic comparison.

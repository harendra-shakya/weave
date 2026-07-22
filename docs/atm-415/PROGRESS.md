# ATM-415 — Session Progress Pointer

**Every session reads this file FIRST.** It names the one issue to work this session. Do only that issue, then update this file LAST (before ending the session). This is the single source of "what's next" — a cold session needs nothing else to orient.

---

## ▶ NEXT: **ATM-419 — nft-storefront (Vitrine)**

Resume at: **not started.** Read `docs/atm-415/atm-419-todo.md` + brand doc. Run full lifecycle: intent → research → selection → plan → engineering → qa → kpi-setup → iteration → analysis → seal.

---

## Issue status

| Order | Issue | App / scope | Status | Resume at |
|------:|-------|-------------|--------|-----------|
| 1 | **ATM-416** | Foundation (contracts, engine, tools) | ✅ done | committed 164785a; validate OK; 58/58 tests pass |
| 2 | **ATM-417** | video-storefront (OneReel) | ✅ done | sealed 2026-07-22; manifest: apps/video-storefront/proof/seal-manifest.json |
| 3 | **ATM-418** | sticker-storefront (Marginalia) | ✅ done | sealed 2026-07-23; manifest: apps/sticker-storefront/proof/seal-manifest.json |
| 4 | ATM-419 | nft-storefront (Vitrine) | ⬜ waiting | after 418 sealed |
| 5 | ATM-420 | Cross-app comparison | ⬜ waiting | after 417/418/419 sealed |
| 6 | ATM-421 | Skill | ⬜ waiting | after apps expose skill gaps |
| 7 | ATM-422 | Fresh-operator exam | ⬜ waiting | after 421 review-ready |
| 8 | ATM-423 | Seal / closeout | ⬜ waiting | after all above |

Legend: ✅ done · ⬜ open · 🔶 conditional · 🚫 blocked

---

## How a session updates this file (at the end)

1. Update the **▶ NEXT** line and the table row for the issue you worked.
2. If the issue is fully complete (evidence in place, committed + pushed), mark it ✅ and point ▶ NEXT at the next order row.
3. If you stopped mid-issue, keep it as next and set **Resume at** to the exact stage (e.g. "qa verified → next is kpi-setup").
4. If blocked, mark 🚫 and name the stop (`ENGINEERING_REQUIRED` / `OWNER_GATE`) + what unblocks it.

The per-app stage detail always lives on disk in `apps/<app>/lifecycle/lifecycle-state.json` — this file is just the top-level index across issues. When they disagree, `lifecycle-state.json` wins for stage truth; fix this file to match.

---

## Last session log (most recent first)
<!-- Each session appends one line: date · issue · what advanced · STATUS/PROOF/NEXT ref -->
- 2026-07-23 · ATM-418 · sticker-storefront (Marginalia) fully sealed: 12 routes, Vinyl Pop design system, variant cart, fulfillment tracker, cancel/refund, artist upload + curator queue · QA 7.25/10 (Nielsen 29/40) · cohort seed=42 CR=13.5% AOV=$12.85 · iteration: variant-clarity (price deltas in picker) · STATUS: ✅ sealed · PROOF: apps/sticker-storefront/proof/seal-manifest.json · NEXT: ATM-419 (nft-storefront)
- 2026-07-22 · ATM-416 · Foundation built and frozen: 9 schemas, 3 specs, seeds, KPI formulas, state-transitions, 2 negative contracts, commerce-core engine, 4 tools, 58-test suite, 11 procedures · commit 164785a pushed · STATUS: ✅ validate OK, 58/58 pass · NEXT: ATM-417 (video-storefront)

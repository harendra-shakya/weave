# ATM-415 — Session Progress Pointer

**Every session reads this file FIRST.** It names the one issue to work this session. Do only that issue, then update this file LAST (before ending the session). This is the single source of "what's next" — a cold session needs nothing else to orient.

---

## ▶ NEXT: **ATM-422 — fresh-operator exam**

Resume at: **not started.** Read `docs/atm-415/atm-422-todo.md`. The skill under test is
`packages/weave-tool/skills/weave-application-lifecycle/` — start from its `QUICKSTART.md`.
Two things ATM-422 should specifically probe, both disclosed in `ENVELOPE.md` rather than hidden:
the four ⚠ engineer-required steps in the quickstart, and whether an operator correctly *recognises*
a situation warranting `ENGINEERING_REQUIRED` (it fires against fixtures; no real run has produced one).

---

## Issue status

| Order | Issue | App / scope | Status | Resume at |
|------:|-------|-------------|--------|-----------|
| 1 | **ATM-416** | Foundation (contracts, engine, tools) | ✅ done | committed 164785a; validate OK; 58/58 tests pass |
| 2 | **ATM-417** | video-storefront (OneReel) | ✅ done | sealed 2026-07-22; manifest: apps/video-storefront/proof/seal-manifest.json |
| 3 | **ATM-418** | sticker-storefront (Marginalia) | ✅ done | sealed 2026-07-23; manifest: apps/sticker-storefront/proof/seal-manifest.json |
| 4 | **ATM-419** | nft-storefront (Vitrine) | ✅ done | sealed 2026-07-23; manifest: apps/nft-storefront/proof/seal-manifest.json |
| 5 | **ATM-420** | Cross-app comparison | ✅ done | docs/atm-415/atm-420-cross-app-comparison.md; 9 defects found in sealed evidence, reported not repaired |
| 6 | **ATM-421** | Skill | ✅ done | packages/weave-tool/skills/weave-application-lifecycle/; 15/15 tests; usage ledger NOT produced (no cost data exists) |
| 7 | ATM-422 | Fresh-operator exam | ⬜ waiting | 421 review-ready — start at its QUICKSTART.md |
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
- 2026-07-24 · ATM-420 + ATM-421 · Cross-app comparison doc written from the three sealed apps; `weave-application-lifecycle` skill package rewritten (pre-wipe comparison set + skill deleted — they contradicted the sealed apps). New: lifecycle-state schema, fail-closed `validate-lifecycle.mjs`, 15 negative tests. Nine defects found in the sealed evidence (D1–D9) plus nonclaim drift (D10), all reported not repaired — the apps' state files sit inside their seal manifests · Improvement log Entry 007 appended · STATUS: ✅ both review-ready, neither marked Done · PROOF: atm-420-cross-app-comparison.md, skills/weave-application-lifecycle/ · NEXT: ATM-422. **Two honest gaps carried forward:** no usage/cost ledger exists for any app in this workspace, and Linear could not be consulted (OAuth unavailable in a non-interactive session) so post-todo scope changes are unreflected.
- 2026-07-23 · ATM-418 · sticker-storefront (Marginalia) fully sealed: 12 routes, Vinyl Pop design system, variant cart, fulfillment tracker, cancel/refund, artist upload + curator queue · QA 7.25/10 (Nielsen 29/40) · cohort seed=42 CR=13.5% AOV=$12.85 · iteration: variant-clarity (price deltas in picker) · STATUS: ✅ sealed · PROOF: apps/sticker-storefront/proof/seal-manifest.json · NEXT: ATM-419 (nft-storefront)
- 2026-07-22 · ATM-416 · Foundation built and frozen: 9 schemas, 3 specs, seeds, KPI formulas, state-transitions, 2 negative contracts, commerce-core engine, 4 tools, 58-test suite, 11 procedures · commit 164785a pushed · STATUS: ✅ validate OK, 58/58 pass · NEXT: ATM-417 (video-storefront)

# ATM-415 — Session Progress Pointer

**Every session reads this file FIRST.** It names the one issue to work this session. Do only that issue, then update this file LAST (before ending the session). This is the single source of "what's next" — a cold session needs nothing else to orient.

---

## ▶ NEXT: **ATM-417 — video-storefront (OneReel)**

Resume at: **not started.** Scaffold the app, run the lifecycle runner, work intent → research → selection → plan → engineering → qa → kpi-setup → iteration → analysis → seal. Read `docs/atm-415/atm-417-todo.md` + `atm-417-brand.md` first.

---

## Issue status

| Order | Issue | App / scope | Status | Resume at |
|------:|-------|-------------|--------|-----------|
| 1 | **ATM-416** | Foundation (contracts, engine, tools) | ✅ done | committed 164785a; validate OK; 58/58 tests pass |
| 2 | ATM-417 | video-storefront (OneReel) | ⬜ next | scaffold → lifecycle runner → intent |
| 3 | ATM-418 | sticker-storefront (Marginalia) | ⬜ waiting | after 417 sealed |
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
- 2026-07-22 · ATM-416 · Foundation built and frozen: 9 schemas, 3 specs, seeds, KPI formulas, state-transitions, 2 negative contracts, commerce-core engine, 4 tools, 58-test suite, 11 procedures · commit 164785a pushed · STATUS: ✅ validate OK, 58/58 pass · NEXT: ATM-417 (video-storefront)

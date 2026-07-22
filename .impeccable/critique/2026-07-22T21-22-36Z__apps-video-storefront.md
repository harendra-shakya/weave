---
timestamp: 2026-07-22T21-22-36Z
slug: apps-video-storefront
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | `if (!ready) return null` → blank flash on hydration, no skeleton |
| 2 | Match System / Real World | 3/4 | "Back this film" verb unexplained on direct-link film detail entry |
| 3 | User Control and Freedom | 3/4 | No visible back-nav from checkout to film detail |
| 4 | Consistency and Standards | 4/4 | Token discipline is model-quality; ember used in exactly 3 semantic roles |
| 5 | Error Prevention | 3/4 | Good auto-format/inputMode; validation fires only on submit (not blur) |
| 6 | Recognition Rather Than Recall | 3/4 | Order summary eliminates memory load; no trust signal in checkout |
| 7 | Flexibility and Efficiency of Use | 2/4 | autoComplete only; no filtering, search, keyboard shortcuts |
| 8 | Aesthetic and Minimalist Design | 4/4 | Transactional surfaces stripped to essentials; zero decorative clutter |
| 9 | Error Recovery | 3/4 | Human error messages, role="alert"; focus doesn't move to first error on submit |
| 10 | Help and Documentation | 2/4 | Demo nonclaims present; no CVC hint, no FAQ, no contextual help |
| **Total** | | **30/40** | **Good — solid foundation, address weak areas** |

## Anti-Patterns Verdict

**LLM assessment: NOT AI SLOP — clear no.**

All absolute-ban patterns checked: no side-stripe borders, no gradient text, no glassmorphism, no hero-metric template, no identical card grids, no numbered section scaffolding. The eyebrow labels appear at semantic moments only.

Newsreader + cream: on the reflex-reject list for greenfield decisions, but brand.md grants identity-preservation exception for committed brand identities. The ember accent, editorial card layout, patronage verb, and refund copy register all read as intentional authorship.

**Deterministic scan: zero findings.** CLI detector exit 0, `[]`. No forbidden patterns detected.

**Browser console: zero errors** across all 7 routes.

## Overall Impression

A rare case of a synthetic demo with genuine design identity. Token architecture, copy register, and refund flow's anti-dark-pattern stance point toward real decisions. Primary weakness: gap between emotional promise (backing a human filmmaker) and functional gaps in transactional flows — hydration blank and absent back-navigation from checkout.

## What's Working

1. **Refund as brand philosophy.** Outlined ember button, no "Are you sure?" layer, post-refund maker credit. Aligned decisions across layout, color, and copy.
2. **Token discipline.** Eleven color tokens, single source of truth, no raw hex in components. Warm-tinted box-shadow reads as parchment lift.
3. **Editorial card layout.** Featured-first 3:2 split, not identical tile grid. Six films feel like six different films.

## Priority Issues

**[P1] Blank content flash on hydration**
- What: `if (!ready) return null` in FilmDetailClient, CheckoutClient, BackedClient, RefundClient — no skeleton/spinner.
- Why: Looks broken on slow connections; damaging on backed/refund pages post-action.
- Fix: Replace null return with loading skeleton.
- Command: /impeccable harden

**[P1] No back-navigation from checkout to film detail**
- What: CheckoutClient has no visible back link to film detail.
- Why: Users re-reading logline before payment have no visible escape; undermines narrative-driven conversion.
- Fix: `<Link href={/films/${filmId}}>← Back to film</Link>` above the form.
- Command: /impeccable harden

**[P2] Submit-only validation with no focus management**
- What: All errors surface simultaneously on submit; focus not moved to first error.
- Why: Screen reader users don't know errors appeared.
- Fix: On-blur validation + focus first error on submit failure.
- Command: /impeccable harden

**[P2] Refund button visual hierarchy inversion**
- What: Outlined ember "Refund" button heavier than "Keep the film" text link.
- Why: Irreversible action is dominant affordance — ambiguous if deliberate.
- Fix: Document as principle or fix hierarchy.
- Command: /impeccable clarify

**[P3] No CVC hint text**
- Fix: `<p id="pf-cvc-hint">3–4 digit code on back of card</p>` wired to aria-describedby.
- Command: /impeccable clarify

## Persona Red Flags

**Jordan**: "Back this film" verb unexplained on direct-link entry; "Buy" in footer creates semantic fork; no CVC hint.
**Casey**: Hydration blank looks like crash on backgrounded return; form data lost on unmount; order summary DOM order below form.
**Sam**: Focus not moved to first error on submit; ember focus ring contrast unverified; DemoUserChip purpose not announced.

## Minor Observations

1. Footer "Buy the film, not the plan." vs CTA "Back this film" — different verbs for same transaction.
2. `::selection { background: var(--or-ember-wash) }` — warm-tinted selection highlight.
3. Footer nonclaim in text-xs text-or-ink-soft — present but lowest-contrast text.
4. Play button on backed page: dark poster colors could yield low contrast for icon.
5. Cognitive load: 8/8 pass.

## Questions

1. Which verb is the brand betting on — "Back" or "Buy"?
2. Is refund button hierarchy a deliberate anti-dark-pattern principle or an accident?
3. Where is the maker's acknowledgment surface after a backing?

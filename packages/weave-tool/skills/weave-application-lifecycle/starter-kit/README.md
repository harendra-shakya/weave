# Starter kit — building the app the lifecycle gates

`SKILL.md` gates quality (`qa` ≥ 7/10, zero P0). It does **not** tell you how to reach it.
This kit is the missing half: the craft the three sealed apps share, extracted so you start from
their level instead of from a blank page.

It does not invent a component library the three apps never had. It extracts what actually recurred:
a **build method**, three real **design systems**, a recurring **component inventory** (contract, not
shared code — the apps' components differ), and the **QA-readiness checklist** that took each app over
the 7/10 line. Every artifact here traces to a sealed app.

**The apps live at <https://github.com/harendra-shakya/weave-v5-apps>** (`apps/<app>/`).
The prepared UI sources they were built from live in this repo at
[`docs/atm-415/ui/`](../../../../../docs/atm-415/ui/) — `onereel/`, `marginalia/`, `vitrine/`.

---

## 1. The build method — port a prepared UI source

Every one of the three sealed apps was built the same way, and none was hand-typed from nothing:
**a prepared Next.js UI source was ported through the lifecycle gates.** A prepared source is a
near-complete App-Router app — `app/` routes, `components/`, `lib/` (typed placeholder data +
localStorage stores + a synthetic `PaymentForm`), `tailwind.config.ts`, a token block, and a
`README.md` with a port checklist. See the three under [`docs/atm-415/ui/`](../../../../../docs/atm-415/ui/);
[`marginalia/README.md`](../../../../../docs/atm-415/ui/marginalia/README.md) is the model.

The generalized procedure (from the three per-app port checklists):

1. **Pick a direction and freeze its brand rules.** Colours, type, CTA wording, hero copy. Marginalia's
   README freezes hero copy *verbatim* as the deterministic baseline — "do not reword." Do the same:
   the copy you freeze is what the cohort baseline is measured against.
2. **Bring the tokens in first.** Merge `tailwind.config.ts` `theme.extend`; copy the token block +
   `@layer` rules into your global stylesheet. Start from one of [`tokens/`](tokens/) below.
3. **Load fonts via `next/font`** in `app/layout.tsx`, mapped to the `--font-*` the tokens expect.
4. **Copy `lib/` and `components/` as-is, then `app/` routes.** No hard-coded hex in components —
   tokens only. This is the "port verbatim" step: you are transcribing a design, not redesigning it.
5. **Swap the synthetic seams — each is one module, and each is a documented ⚠ engineer step:**
   catalog data, order store, submission/intake queue, and `PaymentForm`. Keep the types; replace the
   bodies when you go real. Until then they stay synthetic and public-safe (dataURLs, localStorage).
6. **Run the lifecycle from `engineering`**: build exits 0, contracts validate, golden path verified
   live — then `qa` against the checklist in §4.

**Where an operator without an engineer stops:** step 5 (real seams) and any gate written in bash/
`python3` on Windows. Both are the `⚠` steps named in `QUICKSTART.md`; neither is solved here.

---

## 2. The three design systems

Three genuinely distinct systems (an independent review once found four pre-wipe apps shipping
byte-identical backgrounds — these do not). Copy a [`tokens/`](tokens/) file as your starting point,
or read all three to see the range.

| System | App | Ground / accent | Type | Signature device | Tokens |
|---|---|---|---|---|---|
| **Archival Warmth** | OneReel | cream `#F7F1E6` / **one** ember `#A8431A` | Newsreader serif + Source Sans 3 | accent used *sparingly*; hairline borders; 2–6px radii; light-only | [`archival-warmth.css`](tokens/archival-warmth.css) |
| **Vinyl Pop** | Marginalia | purple `124 77 212` / candy pink·mint·sun | Baloo 2 | hard offset shadow (`.text-pop`), `badge-tilt`, springy pills, 24px cards | [`vinyl-pop.css`](tokens/vinyl-pop.css) |
| **Keepsake** | Vitrine | cream `#fbf6f1` / **one** plum `#8a6fb8` | Nunito | quiet restraint; numbered-edition marks; muted text tuned to WCAG AA | [`keepsake.css`](tokens/keepsake.css) |

Two rules all three follow, and you should too:
- **One accent, used sparingly.** OneReel and Vitrine each commit to a single accent colour for CTAs
  and active states. Restraint is the look.
- **Tokens only in components — never hard-coded hex.** The token sheet is the single source of truth;
  a component that hard-codes a colour is the first crack in a design system.

---

## 3. Recurring component inventory

These recur across all three apps in role, even where names differ. This is a **contract** (what each
must do and which states it must handle), not a shared implementation — each app styles its own. Build
these, in these states, and you have covered what the three sealed apps covered.

| Role | OneReel | Marginalia | Vitrine | Must handle |
|---|---|---|---|---|
| Wordmark | `Wordmark` | `Wordmark` | `Wordmark` | links home; `aria-label` |
| Page header | `PageHeader` | `PageHeader` | `PageHeader` | nav; live cart count with correct singular/plural `aria-label` |
| Page footer | `PageFooter` | `PageFooter` | `PageFooter` | the synthetic-only nonclaim belongs here |
| Product card | `FilmCard` | `PackCard` | `EditionCard` | image/placeholder, price, primary CTA; keyboard-reachable |
| Product placeholder | `PosterPlaceholder` | `StickerPlaceholder` | `EditionArtwork` | generated art only — no external assets (public-safe) |
| Price | `PriceTag` | `PriceTag` | (in card/panel) | one formatter (`lib/format.ts`); never raw numbers |
| Primary CTA | `BackFilmButton` | `AddToCartButton` | `AddToCollectionButton` | ≥44px touch target; disabled + active states |
| Provenance / credit | `MakerCredit` | `ArtistCredit` | `EditionMark` | the accent lives here |
| Empty / invalid / error state | `EmptyState` | `EmptyState` | `EmptyState` | **built for every route** — empty catalog, invalid ID, failed action |
| Payment (synthetic) | `PaymentForm` | `PaymentForm` | `CheckoutPanel` | a test failure card (Marginalia declines `…0002`); `aria-invalid` on errors |
| Fulfilment / steps | — | `FulfillmentStatus` + `StepTracker` | `ReturnPanel` | state machine with **locked** copy; blocks cancel after ship |
| Seller / maker intake | `SubmitFilmForm` | `MakerForm` + curator queue | `MakerForm` | rights attestation; uploads stay in-browser as dataURLs |

The two non-trivial domain patterns worth stealing outright:
- **Marginalia's fulfilment state machine** — `ordered → packed → shipped → delivered` with per-state
  copy locked in `lib/orders.ts`, and cancellation correctly blocked after `shipped`
  ([`FulfillmentStatus.tsx`](https://github.com/harendra-shakya/weave-v5-apps/tree/main/apps/sticker-storefront/components/FulfillmentStatus.tsx)).
- **Marginalia's variant cart** — size × finish × sheet-count, labelled exactly "Size · Finish ·
  Sheet count" (`VariantSelector.tsx`).
- **Vitrine's prohibition contract** — proving a surface is *absent*. Already canonized in `SKILL.md`
  §Prohibition contracts; that's the one piece of craft that made it into the gate layer.

---

## 4. QA-readiness checklist — clear the 7/10 gate before you submit to it

The `qa` gate is `impeccable` ≥ 7/10, zero P0. These are the exact defect classes that were caught at
that gate across the sprint — pre-clear them and you arrive at QA already above the floor instead of
bouncing back to engineering.

**Contrast (the one that keeps happening — 5 defects, 3 apps, caught *only* by the critique):**
- [ ] Every text token clears **WCAG AA ≥ 4.5:1** on its background (≥ 3:1 for ≥ 24px/bold).
      Marginalia shipped one deferred failure (`text-ink-faint` ~2.9:1, 8+ places) — don't.
- [ ] `--ks-muted` in [`keepsake.css`](tokens/keepsake.css) is the worked example of a token tuned to
      pass (oklch 53%). A "faint" token exists for decoration — never put body text in it.
- [ ] **Run the checker** — `tools/check-contrast.mjs` computes WCAG ratios over a token sheet and
      fails closed on any pair below AA. Pure Node, handles hex / RGB-channel / oklch. Declare the
      real pairs in a manifest ([`tokens/keepsake.pairs.json`](tokens/keepsake.pairs.json) is the
      worked example — it computes `--ks-muted` at 4.92:1, matching the value Vitrine sealed at):

      ```bash
      node ../tools/check-contrast.mjs --tokens tokens/keepsake.css --pairs tokens/keepsake.pairs.json
      ```

**Accessibility tree (the five Assessment B caught in Marginalia that no build/test/contract found):**
- [ ] No heading-level skips (`h1 → h2 → h3`, never `h1 → h3`).
- [ ] No doubled/competing live regions — one `role="status"`, not two; never 8 simultaneous
      `role="alert"` regions.
- [ ] `aria-invalid` on form fields in the error state.
- [ ] Every icon-only / bare control (remove, close, cart) has an accessible name.
- [ ] Cart and other live counts carry a correct singular/plural `aria-label`.

**Reachability & states:**
- [ ] Every declared route in the user journey is reachable and keyboard-operable (a build compiles an
      invisible button and an unreachable route without complaint).
- [ ] Every route has its **empty / invalid / failure** state built — not just the happy path.

**Run it dual-agent where you can:** design/UX (Nielsen) in parallel with a browser
accessibility-tree pass. The tree pass is what caught the five above; a single inline pass misses them
and must emit the degraded banner.

---

## What this kit still does not give you

- **A finished product.** It gets you to the three apps' *starting craft*, not past the ⚠ engineer
  steps (real payment/data seams, non-portable gates).
- **A generic component library.** The inventory is a contract; you still implement per app.
- **The contrast checker.** Still manual (backlog #3).
- **Any evidence anyone wants the app.** The cohort is synthetic — see `QUICKSTART.md` §"What you
  will not get".

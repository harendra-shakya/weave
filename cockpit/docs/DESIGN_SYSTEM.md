# WEAVE 0.2 Owner Cockpit — Visual Design & Component System

> Deliverable for **[ATM-385](https://linear.app/atumera-llc/issue/ATM-385/weave-02-screen-map-wireframes-and-visual-design-for-local-owner)** (part 2 — visual design + component/status system).
> Tokens live in [`../styles/tokens.css`](../styles/tokens.css) and are the single source of truth — this doc explains them and specs the components built on top.
> Hi-fi mockups: [command-center-hifi.svg](assets/mockups/command-center-hifi.svg), [gates-hifi.svg](assets/mockups/gates-hifi.svg).

---

## 1. Design direction

Dark, information-dense **mission-control / console** aesthetic. The owner scans a lot of state quickly and must trust it — so: calm dark surfaces, one accent (blue), semantic color reserved almost entirely for **status** (the 6 attention states + proof/simulated), monospace for IDs/paths/evidence, generous use of muted text for secondary detail. Nothing decorative competes with status signal.

---

## 2. Color tokens

| Group | Token | Value | Use |
|---|---|---|---|
| Surface | `--bg-0` | `#0e1116` | app background |
| | `--bg-1` | `#151a21` | panel / card |
| | `--bg-2` | `#1c232c` | raised row |
| | `--bg-3` | `#232c37` | hover / active |
| Border | `--border` / `--border-strong` | `#2b3543` / `#3a4654` | dividers, panel edges |
| Text | `--text-0/1/2` | `#e6ebf2` / `#aab4c0` / `#6f7d8c` | primary / secondary / muted |
| Accent | `--accent` | `#4f8cff` | links, active nav, primary affordance |

Accent is **not** used for status — status owns color so it never competes.

## 3. Owner Attention status palette (the core system)

Six states, evaluated in priority order (brief §3.3). Rendered by the **Attention Pill** via `data-attn`:

| State | `data-attn` | Token | Swatch intent | When |
|---|---|---|---|---|
| Blocked | `blocked` | `--attn-blocked` `#ff5d5d` | red | hard-blocked until validated |
| Approval required | `approval` | `--attn-approval` `#ffb84d` | amber | a Gate awaits owner approval |
| Needs owner | `needs-owner` | `--attn-needs-owner` `#ff8a4c` | orange | open question / owner action |
| Ready for review | `ready` | `--attn-ready` `#57a6ff` | blue | proof recorded, awaiting review |
| Stale / no proof | `stale` | `--attn-stale` `#8b97a5` | grey | current stage proof missing, idle |
| None | `none` | `--attn-none` `#46c980` | green | nothing pending |

**Proof semantics** (Proof Ledger + Event Log): `--proof-real` (green) = real local proof; `--proof-sim` (sand/amber) = **SIMULATED external effect**. These two must always be visually distinct so a simulated action is never mistaken for a real one.

## 4. Typography & spacing

- Fonts: `--font-sans` (system) for UI; `--font-mono` for IDs, file paths, evidence refs, commands.
- Scale: `--fs-xs 11` · `--fs-sm 12` · `--fs-base 13` · `--fs-md 15` (section heads) · `--fs-lg 20` (page title) · `--fs-xl 26` (KPI numbers).
- Spacing: 4px base (`--sp-1`…`--sp-10`). Panels pad `--sp-6`; rows pad `--sp-3`/`--sp-4`.
- Radii: `--r-sm 6` (rows/inputs), `--r-md 8` (panels/cards), `--r-pill` (pills/badges).

---

## 5. Component specs

Each maps directly to a React component in `cockpit/components/` (ATM-386). States are driven by tokens, never hard-coded colors.

### 5.1 Attention Pill `<AttentionPill state>`
Small rounded pill; `data-attn` sets fg+bg from the palette. Label uses the canonical string ("Blocked", "Approval required", …). The single most-reused component — appears on Command Center rows, Room/Mission cards, list tables. Size variants: `sm` (table cell), `md` (card header).

### 5.2 Lifecycle Stage Rail `<StageRail stages>`
Horizontal 11-step rail; steps in fixed order (intent…analysis). Per step: `state` → `complete` (green check), `active` (accent, glow border), `blocked` (red, dashed border), `not_started` (muted). A small dot shows `proof_state` (`recorded`=green, `missing`=red, `not_required_yet`=hollow). Compact labels; full label on hover/title.

### 5.3 Cards — Room / Mission / Proof / Gate
Shared card shell: `--bg-1`, `--r-md`, `--border`, header row (title + AttentionPill), body of label/value lines, optional footer. Variants differ only in body fields:
- **Room card:** name · current stage · open-mission count · attention.
- **Mission card:** objective · room · runtime · due · proof status · attention.
- **Proof card:** claim · proof surface tag · real/sim marker.
- **Gate card:** gated action · blast-radius tag · per-provider status · decision.

### 5.4 Non-Claims Callout `<NonClaims items>`
Low-emphasis block on `--bg-2`, muted text, bold "Not proven" label, bulleted `non_claims[]`. Always rendered next to any claim/approval so local proof is never overstated.

### 5.5 Mirror/Courier Badge `<MirrorBadge tool>`
Small badge: "{Linear|Slack|GitHub} · Mirror — not source of truth" (or "Courier" for Slack). Neutral styling; appears on Room Detail, Settings.

### 5.6 Proof-Boundary Banner `<BoundaryBanner>`
Persistent top strip (`--boundary-bg`, `--banner-h`): "Local-only cockpit · fixture data · no secrets · external actions simulated". Always visible, never dismissible.

### 5.7 Review-Loop Stepper `<ReviewLoop state>`
5 steps Observe → Validate → Govern → Review → Sync. Each step shows its `review_loop_state` value (`recorded`/`pending`/`pending_owner_context`/etc.). Connected stepper; completed = accent, pending = muted.

### 5.8 Action Button `<LocalAction>`
Owner actions (Approve, Hold, Mark ready-for-review, Post note, Acknowledge). Primary = accent border on `--bg-3`. **Every action that touches an external surface renders the boundary note** "External effect is SIMULATED — no real action performed" adjacent, and the resulting Event Log entry is tagged `--proof-sim`.

### 5.9 App Shell `<Shell>`
`--nav-w` left nav (brand + 7 destinations, active = accent on `--bg-2`) + BoundaryBanner + content area padded `--content-pad`. Every route renders inside it.

### 5.10 Feedback states — `<EmptyState>` / `<LoadingSkeleton>` / `<ErrorPanel>`
The three non-populated states every data screen needs (per-screen copy is specified in [WIREFRAMES.md §5](WIREFRAMES.md)). All three are token-driven and carry **no semantic/status color** — they must never be mistaken for an attention state.
- **EmptyState** — centered single line on `--bg-1`, `--text-2` muted, optional one-line route hint. Example: "All clear — nothing needs you." Never an error tone.
- **LoadingSkeleton** — greyed placeholder rows/cards using `--bg-2` blocks at ~50% on `--bg-1`; **no spinner** (reads are local + synchronous-feeling). Mirrors the real layout's row/card shape so there's no reflow jump.
- **ErrorPanel** — bordered panel, `--border-strong`, `--text-1` body with a muted secondary line pointing to Settings. **Safe by construction:** shows the `<cockpit>/fixtures/…` placeholder path only — never a real user home path, secret, or raw stack trace. Uses neutral chrome, not `--attn-blocked`, so a read failure is never confused with a WEAVE "blocked" state.

---

## 6. States & interaction notes
- **Hover:** rows lift to `--bg-3`; cards raise `--shadow-1`.
- **Active route:** nav item accent text + `--bg-2` fill.
- **Clickable attention:** Command Center rows and KPI tiles are filters → navigate to the filtered Gate/Mission/Room view.
- **Empty / loading / error:** see §5.10 — empty = muted single line + route hint; loading = layout-matched skeleton (no spinner); error = neutral panel pointing to Settings, never status-colored, never leaking paths/secrets.
- **Density:** default compact; one width (desktop, ≥1280). No mobile in MVP scope.

## 6a. Iconography & asset policy
Source/tool identities (WEAVE, Linear, Slack, GitHub, and the runtimes Codex / Claude / Local runtime) are rendered as **text wordmarks / labels with a small monochrome glyph slot**, not fetched brand logos. This is a deliberate constraint, not an omission:
- **Local-only / no network:** the cockpit makes no outbound calls (brief §A4), so it ships **no remote logo assets**; identities stay as in-repo text.
- **Runtime naming:** runtimes are labeled `Codex`, `Claude`, `Local runtime`. The legacy example runtime name listed in ATM-385 is intentionally **not used** — the repo's `public_safe_repo_scan.py` blocks it as a legacy surface (brief §8 / Q2). This is the one ATM-385 asset the design knowingly substitutes.
- Mirror/Courier tools (Linear/Slack/GitHub) always appear **with the Mirror/Courier badge**, never as a bare logo, so a tool icon is never mistaken for source-of-truth.

## 6b. Hi-fi coverage & deferred screens
Hi-fi mockups are delivered for the **two screens that carry the demo's decision weight**: Command Center (the attention hub) and the Gate / Approval Queue (the owner action). **Screens 2–6, 8, 9 (Rooms, Missions, Proof Ledger, Runtime, Settings) are deliberately deferred at hi-fi** — they are **not dropped**: their low-fi wireframes ([WIREFRAMES.md](WIREFRAMES.md)) plus the tokens and component specs in this document are the build spec, and they inherit the exact same Shell, palette, and components proven in the two hi-fi targets. ATM-386 builds all 9 against `tokens.css`; hi-fi for the deferred screens, if wanted, is a fast follow once the components exist in code.

## 7. Mapping back to the build (ATM-386)
`tokens.css` imports first; components in §5 become files in `cockpit/components/`; screens in [WIREFRAMES.md](WIREFRAMES.md) §1 become `app/**/page.tsx`. The hi-fi mockups in `assets/mockups/` are the visual target for Command Center and the Gate Queue (the action screen).

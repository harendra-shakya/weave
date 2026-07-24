# Craft — specialist skills wired to the lifecycle stages

`SKILL.md` orchestrates; `starter-kit/` teaches the port method and the QA-readiness bar. This folder
adds the missing third piece: **specialist craft skills**, one per narrow job (brand ideation, design
system, component build, spec writing, i18n, performance…), so a stage that needs deep method has it on
hand instead of improvising.

These are **reference method, not gates.** Consult the relevant one at the stage below; nothing here
changes what the lifecycle *proves* (that is still `ENVELOPE.md`). They raise the quality of what you
build, the way `starter-kit/` does — not the boundary of what it claims.

## Provenance & license

Vendored from **[rampstackco/claude-skills](https://github.com/rampstackco/claude-skills)** (MIT),
snapshot at upstream commit `e42ec5a`. The MIT `LICENSE` (© 2026 RampStack Co.) travels with them in
[`LICENSE`](LICENSE) — keep it. This is a **snapshot**: it does not track upstream, so re-pull from that
repo if you need a newer version. We did not modify the skill bodies.

## Which skill, at which stage

| Lifecycle stage / checklist domain | Skill | What it gives you |
|---|---|---|
| **intent** — name a *distinct* design direction (the differentiation `LOG` Entry 001 #9 asked for) | [`brand-ideation`](brand-ideation/) | positioning territories, naming, mood directions, converging many half-ideas to one |
| **intent → engineering** — turn the direction into a visual system | [`brand-identity`](brand-identity/) · [`brand-archetype-system`](brand-archetype-system/) · [`logo-design`](logo-design/) | logo/color/type/imagery system; 12 archetype starting points across 18 verticals; logo variants |
| **intent** — document the direction so it stays coherent across routes | [`brand-style-guide`](brand-style-guide/) | the canonical brand reference (story, logo, color, type, voice, dos/don'ts) |
| **engineering** — extend the brand into specific creative | [`art-direction`](art-direction/) · [`creative-direction`](creative-direction/) | photography/illustration/campaign direction; a four-axis aesthetic brief downstream work consumes |
| **engineering** — build the UI to a production bar | [`design-system`](design-system/) · [`design-standards`](design-standards/) · [`frontend-component-build`](frontend-component-build/) | tokens/component-library method; production page/component standards; accessible component architecture |
| **plan** — turn intent into checkable ACs | [`pm-spec-writing`](pm-spec-writing/) | PRDs, user stories, acceptance criteria, dev briefs — the traceability the retrospective-plan failure (`LOG` Entry 001 §6) needs |
| **COMMERCE-CHECKLIST §J** (security) | [`security-baseline`](security-baseline/) | HTTPS/TLS, security headers, CSP, secrets, OWASP baseline |
| **COMMERCE-CHECKLIST §P** (i18n) | [`internationalization`](internationalization/) | locale strategy, hreflang, translation workflow, RTL |
| **COMMERCE-CHECKLIST §L** (performance) | [`performance-optimization`](performance-optimization/) | Core Web Vitals, bundle/asset optimization, render performance |
| **COMMERCE-CHECKLIST §L/§U** (ops cost) | [`cost-optimization`](cost-optimization/) | infra/SaaS spend audit, rightsizing, vendor consolidation |

## Two honest limits

- **The brand/design cluster raises the ceiling; it does not close the envelope.** A distinct, well-run
  identity is what made the three sealed apps distinguishable (the counter to the pre-wipe "four apps,
  one face"). It is necessary for a good app, not sufficient — the functional gaps (`LOG` Entry 001) were
  gate failures, not brand failures.
- **`security-baseline`, `internationalization`, `performance-optimization`, `cost-optimization` map to
  domains this skill tags `[OWNER]`/`[ENG]`.** Their *method* is useful reference; bundling them does not
  move those concerns inside the proven local-Next.js-synthetic envelope. Recording a stop is still the
  honest answer when they require real access.

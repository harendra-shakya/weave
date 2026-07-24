# Quickstart — starting a new app

For an operator who is not a software engineer. Read [`ENVELOPE.md`](ENVELOPE.md) first: it says
where this is proven and where it is not, and it is short.

**Before you start, know what this is honest about.** This process produces a *sealed, auditable
record* of a small local storefront. It does not produce a deployed business, and it does not tell
you whether anyone wants what you built. The measurements are synthetic. See §"What you will not
get" at the end — it is the most useful section here.

---

## What you need

- Node 20+ and a terminal.
- A repo with the `contracts/`, `tools/` and `apps/` layout. **Clone the reference:**
  `git clone https://github.com/harendra-shakya/weave-v5-apps` — it has the `cohort-runner.mjs` and
  `seal-app.mjs` you will run in steps 3–4 and the frozen `contracts/`. Work inside it, or copy its
  `tools/` and `contracts/` into your own repo before step 3 (this skill package ships only the
  validator; the runner and sealer live in that repo).
- A description of the app: what it sells, who buys it, what "working" means.
- **An engineer available for the steps marked ⚠ below.** There are four. Nobody has yet run this
  end to end without one; ATM-422 is the ticket that tests whether that is possible.

---

## The path

### 1. Create the record

```bash
mkdir -p apps/<app-id>/lifecycle
cp <skill>/templates/lifecycle-state.template.json apps/<app-id>/lifecycle/lifecycle-state.json
```

Open it, set `app_id`, delete `_template_note`, and replace the placeholder line in `non_claims`
with everything your app does not prove. **Leave the first entry exactly as written** — the
synthetic-only sentence is checked character for character, and the record will not validate
without it.

Then, before anything else:

```bash
node <skill>/tools/validate-lifecycle.mjs --root . --app <app-id>
```

Get into the habit now. Run it after every stage. It is the only thing standing between you and a
record that quietly says something untrue.

### 2. Work the stages in order

`SKILL.md` has the full reference — inputs, outputs, gates, and the failure mode that has actually
occurred at each stage. The short version:

| Stage | You produce | It advances when |
|---|---|---|
| intent | goal, target user, success criteria, non-goals | the user journey is written as steps you could walk |
| research | facts, assumptions and opinions kept apart | disconfirming evidence is present |
| selection | the choice and what you rejected | at least one rejected alternative has a reason |
| plan | tasks + acceptance criteria | criteria are checkable by someone else, and the plan predates the build |
| engineering ⚠ | the working app | build exits 0, contracts validate, golden path verified live |
| qa | the design critique | **≥ 7/10 and zero P0** — below either, it goes back |
| deployment | *(stop)* | owner-gated — record it and move on |
| kpi-setup ⚠ | frozen baseline + cohort run | freeze **first**, then run, then link the run, then run again |
| marketing | *(stop)* | owner-gated — record it and move on |
| iteration | one bounded change + retest | same seed, no guardrail breach, verdict follows the frozen rule |
| analysis | what worked, what didn't, what you don't know | unknowns are labelled unknown |
| seal ⚠ | the manifest | the validator exits 0 |

After each stage: write the proof file, set the stage to `verified` with its proof ref, run the
validator.

### 3. Measure

```bash
node tools/cohort-runner.mjs --app <app-id> --seed 42 --count 200
```

Three things about this, all of which have gone wrong before:

- **Freeze before you run.** Record the commit in `contracts/freeze-digests.json` first. One sealed
  app ran its baseline under a null freeze, which that file's own rules call invalid.
- **Run it twice.** Two identical runs are the determinism proof. One run proves nothing.
- **It cannot see your UI.** Four adaptations in a row — a CTA rewrite, a variant picker, a
  provenance mark — each returned a delta of exactly zero. That is the engine having no
  representation of copy or layout, not your change failing. Do not run an experiment that asks
  it a question it cannot answer.

### 4. Seal

```bash
node <skill>/tools/validate-lifecycle.mjs --root . --app <app-id>   # must exit 0
node tools/seal-app.mjs --app <app-id>
```

The record goes *inside* the seal. Fix it before sealing, not after.

---

## ⚠ What still requires an engineer

Each of these has a citation, because "you might need help here" is useless without knowing why.

1. **Building the app itself.** The lifecycle does not write your application. It gates and records
   it. Every one of the three sealed examples was built by porting a prepared UI source —
   **[`starter-kit/`](starter-kit/README.md) is how you do that**: the port method, three real design
   systems you can copy, the component inventory, and the checklist that clears the QA gate. It gets
   you to the sealed apps' starting craft; it does not get you past the real payment/data seams below.

2. **Any gate written in bash or Python, on Windows.** `unit_tests_pass` uses shell test syntax and
   `no_secret_leakage` uses `python3`; on a Windows runner both fail with exit 9009 and advance on
   operator judgement instead (`video-storefront/proof/engineering-eval-result.json`). Four
   recurrences and still open. You can disclose the override; you cannot fix it.
   *(The validator in this package is pure Node specifically so it is not one of these.)*

3. **Contrast, in practice.** Five contrast defects across the sprint were caught only by human
   judgement in the critique. There is now a check for the token-level case:
   `node tools/check-contrast.mjs --tokens <sheet.css> --pairs <pairs.json>` fails closed below WCAG
   AA (see [`starter-kit/`](starter-kit/README.md) §QA-readiness). Run it — but it only sees declared
   token pairs, so contrast produced at runtime (text over images/gradients) still needs a human eye.

4. **Anything the validator rejects that is a real defect** rather than a bookkeeping slip. A
   missing proof file you can restore. A schema migration or a broken adapter you cannot — record
   `engineering_required` with the reason and stop.

## When to stop

Two stops, and recording one is a success, not a failure:

- **`ENGINEERING_REQUIRED`** — set the stage's state to `engineering_required` and write a
  `reason`. Something needs building that this process cannot build.
- **`OWNER_GATE`** — set `owner_gate_blocked` with a `reason`. Something needs a decision or an
  access only the owner holds: deployment, marketing, credentials, spend, publication, or **any
  change to a frozen contract, seed, or KPI formula**.

The validator rejects a stop that names no reason, so you cannot record one uselessly.

Working around a stop to keep going is the one thing that breaks this process outright. The record
would then claim a completion that did not happen, and everything downstream inherits the lie.

---

## What you will not get

- **Any evidence that anyone wants this.** Zero real users have seen any app built this way. A
  synthetic conversion rate of 13.5% is a property of a seed and a probability table someone wrote
  by hand. It is not a forecast, and it should never be quoted as one.
- **A deployed app.** `deployment` and `marketing` have never completed in any run. They need a
  provider, a processor, and owner approval.
- **A guarantee the app is good.** The QA gate sets a floor — 7/10, zero P0 — not a ceiling. Before
  that gate existed, apps scored 91–100% on every stage while an independent review rated them
  3.6/10.
- **A cost figure.** No wall-time or token ledger exists for any of the three sealed apps, so
  whether this is cheaper than hiring an engineer is currently unmeasurable in either direction.

---
name: weave-guided-intake
description: The pre-intent phase for guided mode — turn a shallow prompt into a brand vision, one specific target customer, success criteria, and a visual direction before any file is written, by running brand-ideation then grill-me and emitting a structured intake.json that auto-populates intent.json.
---

# WEAVE Guided Intake

## Use When

Use this skill when the owner is in **guided mode** (`"mode": "guided"` in
`lifecycle/lifecycle-state.json`) and the application is at, or before, the
`intent` stage. It runs once, ahead of the lifecycle proper, and produces the
inputs the `intent` stage needs.

Guided mode exists for owners who want a production-grade application from a
shallow starting prompt and do not yet know terms like "design tokens",
"conversion", or "target persona". This skill extracts that depth for them.

A shallow prompt — "I want to build a store", "something for dog owners" — is
enough to start. This skill does the extraction; the owner only answers questions.

## Inputs

- **shallow prompt** — the owner's one-line idea (any length; one line is fine)
- **app id** — short slug (created if absent)
- **owner constraints** — anything already declared off-limits

## Outputs

- `lifecycle/intake.json` — the structured depth-extraction result (schema below)
- `intent.json` — auto-populated from `intake.json` (goal, target user, success
  criteria, non-goals, approval boundaries)
- a short readback the owner confirms before the `intent` stage begins

## Procedure

Run the two extraction skills in order. Both are named in
`packages/weave-tool/skill-registry.json` under the `pre-intent` stage.

### Step 1 — Brand vision (invoke `brand-ideation`)

Invoke the `brand-ideation` skill against the shallow prompt. Extract and record:

- **brand vision** — what this product stands for in one sentence
- **target customer** — *one specific person*, not a segment. Name their
  situation, not a demographic ("a first-time apartment renter with a rescue
  dog and no yard", not "pet owners aged 25–40")
- **desired emotional response** — how that person should feel using it
- **visual direction references** — 2–4 concrete reference points (products,
  moods, or aesthetics) that define the look
- **what "beautiful" means for this product** — stated in the owner's words

Do not proceed until each field has a concrete answer. If the owner cannot
answer, offer options drawn from `brand-ideation` and let them pick.

### Step 2 — Intent depth (invoke `grill-me`)

Invoke the `grill-me` skill with intent-focused questions. Extract and record:

- **problem** — the specific problem the product solves
- **who has it acutely** — which one person feels this problem most sharply
  (reconcile with the Step 1 target customer; they should be the same person)
- **90-day success criteria** — what "working" looks like 90 days from launch,
  stated as something observable
- **explicit non-goals** — what this product will deliberately not do

`grill-me` should keep asking until each branch is resolved — do not accept a
vague answer where a specific one is needed.

### Step 3 — Emit `intake.json`

Write `lifecycle/intake.json`:

```json
{
  "schema": "weave-guided-intake/v1",
  "app_id": "<app-id>",
  "source_prompt": "<the shallow prompt>",
  "brand": {
    "vision": "",
    "target_customer": "",
    "desired_emotion": "",
    "visual_references": [],
    "beautiful_means": ""
  },
  "intent": {
    "problem": "",
    "who_has_it_acutely": "",
    "success_criteria_90d": "",
    "non_goals": []
  }
}
```

### Step 4 — Populate `intent.json` and read back

Map `intake.json` into the `intent.json` the `intent` stage expects:

- `goal` ← `brand.vision` refined by `intent.problem`
- `target_user` ← `brand.target_customer` (must equal `intent.who_has_it_acutely`)
- `success_criteria` ← `intent.success_criteria_90d`
- `non_goals` ← `intent.non_goals`
- `approval_boundaries` ← owner constraints
- carry `brand.visual_references` and `brand.beautiful_means` forward so the
  `selection` stage (`design-an-interface`) and `plan` stage (`design-system`)
  have the visual direction

Read the populated `intent.json` back to the owner in plain language and get a
confirmation before handing control to the `intent` stage.

## Rules

- One specific person, never a segment. If the target customer is a demographic,
  the extraction is not done.
- Do not write any application file (no `src/`, no catalog, no components) during
  intake. Intake produces `intake.json` and `intent.json` only.
- Every field must trace to an owner answer. Do not invent brand vision or
  success criteria the owner did not confirm.
- This skill only runs in guided mode. In loop mode, the `intent` stage runs
  directly with no pre-intent extraction.

## Stop Conditions

- The owner declines to answer enough to fill the required fields, and no offered
  option is accepted — stop and record what is missing.
- The shallow prompt requires a stack, integration, or capability the owner has
  not authorized — this is an owner decision; surface it before the `intent`
  stage rather than assuming it.

## Verification

Intake is complete when:
- `lifecycle/intake.json` exists with every required field non-empty;
- `intent.json` is populated and its `target_user` equals
  `intake.intent.who_has_it_acutely`;
- the owner has confirmed the readback.

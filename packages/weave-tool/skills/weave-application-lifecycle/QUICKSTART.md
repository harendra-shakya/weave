# Quickstart — No engineering background required

This guide gets you from nothing to a running lifecycle in under 15 minutes.
You do not need to know how to code. You need a terminal and Node.js installed.

---

## What you are doing

You are going to create a small application — any kind: a web store, a tool, a
service — and take it through a structured series of stages so that at the end
you have real evidence that it works, and a clear decision about what to do next.

The lifecycle has 11 stages. Two of them require your approval before anything
happens (deployment and marketing). The rest run automatically, one after the
other, guided by a runner that tells you exactly what to do at each step.

---

## Before you start

You need:
- [Node.js](https://nodejs.org) 18 or newer installed (`node --version` to check)
- The `weave` repository cloned on your computer
- A new folder for your app — we will call it `my-app` in this guide

You do **not** need:
- A GitHub account
- A hosting account
- Any payment credentials
- Any prior software development experience

---

## Step 1 — Create your app folder and lifecycle state

Open a terminal. Navigate to your new app folder.

Copy the lifecycle template to start tracking your progress:

```sh
cp <weave-repo>/packages/weave-tool/skills/weave-application-lifecycle/templates/lifecycle-state.template.json \
   lifecycle/lifecycle-state.json
```

Open `lifecycle/lifecycle-state.json` in any text editor. Change the two
placeholders:

- `"app_id": "<app-id>"` → a short name with no spaces, like `my-store`
- `"updated_at": "<ISO-8601>"` → today's date, like `2026-07-17T00:00:00Z`

Remove the `"_template_note"` line. Save the file.

Confirm the file is valid:

```sh
node <weave-repo>/packages/weave-tool/skills/weave-application-lifecycle/tools/validate.mjs \
  lifecycle/lifecycle-state.json
```

You should see `OK — lifecycle/lifecycle-state.json`. If not, fix the errors it
lists before continuing.

---

## Step 2 — Run the lifecycle runner for the first time

```sh
node <weave-repo>/packages/weave-tool/skills/weave-application-lifecycle/runner/lifecycle-runner.mjs \
  --app my-store \
  --root .
```

The runner prints a prompt. That prompt tells you exactly what to do for the
**intent** stage. Read it. Do the work it describes. Write the proof it asks for.

---

## Step 3 — Update your state and repeat

After you complete a stage, open `lifecycle/lifecycle-state.json` and update
that stage's entry:

```json
{
  "stage": "intent",
  "state": "verified",
  "eval_result_ref": "proof/intent-eval-result.json",
  "eval_score_percent": 90
}
```

Then run the runner again. It reads your state and gives you the next prompt.
Repeat until it prints:

```
ALL STAGES COMPLETE — my-store is ready to seal and close.
```

---

## What the stages mean (plain language)

| Stage | You prove |
|---|---|
| Intent | The problem is real and worth solving |
| Research | You know who the users are and what alternatives exist |
| Selection | You chose the right approach from real options |
| Plan | There is a concrete plan with acceptance checks |
| Engineering | The app runs and the tests pass |
| QA | All promised behaviors are covered |
| **Deployment** | *(You approve this)* The app goes live |
| KPI Setup | You can measure whether the app is working |
| **Marketing** | *(You approve this)* A launch campaign goes out |
| Iteration | One improvement was made, measured, and decided |
| Analysis | You know what the app achieved and what to do next |

Stages marked *(You approve this)* pause and wait for you. The runner tells you
what it needs. Nothing goes live without your explicit action.

---

## Useful tools

| Tool | What it does |
|---|---|
| `tools/validate.mjs <file>` | Checks a lifecycle-state.json for errors |
| `tools/seal.mjs --dir <dir>` | Creates a checksum manifest of any directory |
| `tools/kpi-compare.mjs --baseline <b> --current <c>` | Shows the delta between two KPI snapshots |
| `tools/generate-events.mjs --seed <n> --count <n>` | Generates deterministic synthetic test events |

---

## If something goes wrong

**"lifecycle-state.json not found"** — You ran the runner from the wrong
directory, or you did not copy the template. Check that `lifecycle/lifecycle-state.json`
exists relative to where you ran the command.

**"PROOF MISSING"** — The runner found a stage marked `verified` but its
proof file does not exist on disk. Restore the proof file, or set the stage
back to `not_started`.

**"OWNER ACTION REQUIRED"** — You have reached a stage that needs your
approval (deployment or marketing). The runner tells you exactly what to provide.
Once you have provided it, update the state and run the runner again.

**"ENGINEERING_REQUIRED"** or **"OWNER_GATE"** — The lifecycle hit a wall it
cannot cross on its own. Read the message. It names what is needed and who
provides it.

---

## Examples

Three completed examples live in:
```
packages/weave-tool/skills/weave-application-lifecycle/examples/
```

Each shows what a finished lifecycle-state.json looks like for a real
application that went through all 11 stages. Read them to understand what
"done" looks like before you start.

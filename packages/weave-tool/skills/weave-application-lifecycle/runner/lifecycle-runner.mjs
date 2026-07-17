#!/usr/bin/env node
// Lifecycle runner — reads an app's lifecycle-state.json, finds the next
// actionable stage, and prints the stage prompt for Claude to act on.
//
// Works for any application type. No commerce-specific assumptions.
//
// Usage:
//   node lifecycle-runner.mjs --app <app-id> --root <path-to-repo>
//
// The caller runs the runner, feeds the prompt to Claude, Claude does the work,
// then the caller runs the runner again. Repeat until "ALL STAGES COMPLETE".
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OWNER_GATED = new Set(['deployment', 'marketing']);

const STAGE_ORDER = [
  'intent', 'research', 'selection', 'plan', 'engineering',
  'qa', 'deployment', 'kpi-setup', 'marketing', 'iteration', 'analysis',
];

const STAGE_GOAL = {
  intent:      'Clarify the problem, target user, success criteria, and approval boundaries.',
  research:    'Gather product-market facts, identify risks, and separate facts from assumptions and opinions.',
  selection:   'Choose the right solution from real alternatives; record the decision rationale.',
  plan:        'Produce a bounded implementation plan with acceptance checks and approval gates.',
  engineering: 'Build the application; make tests pass; verify all specified behaviors.',
  qa:          'Cover all specified behaviors; record non-claims; produce a QA eval result.',
  deployment:  'Deploy the application to a live URL with the owner\'s explicit approval.',
  'kpi-setup': 'Establish a baseline metric run with a repeatable measurement method.',
  marketing:   'Produce a launch campaign and send plan with the owner\'s explicit approval.',
  iteration:   'Apply one improvement, remeasure, and record a GO/ITERATE/PIVOT/STOP decision.',
  analysis:    'Document the application\'s trajectory and decide the next investment.',
};

const STAGE_PROOF = {
  intent:      'proof/intent-eval-result.json — goal, target user, success criteria, non-goals, approval boundaries',
  research:    'proof/research-eval-result.json — sourced facts, assumptions, opinions, disconfirming evidence',
  selection:   'proof/selection-eval-result.json — alternatives considered, decision rationale',
  plan:        'proof/plan-eval-result.json — implementation plan, acceptance checks, approval gates',
  engineering: 'proof/engineering-eval-result.json — test results, behavior verification evidence',
  qa:          'proof/qa-eval-result.json — behavior coverage, non-claims',
  deployment:  'proof/deployment-eval-result.json — live URL, deployment log, owner approval record',
  'kpi-setup': 'proof/kpi-setup-eval-result.json — baseline run, measurement method, reproducibility proof',
  marketing:   'proof/marketing-eval-result.json — campaign assets, send plan, owner approval record',
  iteration:   'proof/iteration-eval-result.json — adaptation applied, retest results, decision recorded',
  analysis:    'proof/analysis-eval-result.json — trajectory summary, next investment decision',
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i].replace(/^--/, '')] = argv[i + 1];
  }
  return args;
}

function resolveStatePath(root, appId) {
  // Supports two layouts:
  //   apps/<app-id>/lifecycle/lifecycle-state.json  (monorepo layout)
  //   lifecycle/lifecycle-state.json                (standalone app layout)
  const monorepo = path.join(root, 'apps', appId, 'lifecycle', 'lifecycle-state.json');
  const standalone = path.join(root, 'lifecycle', 'lifecycle-state.json');
  if (existsSync(monorepo)) return { statePath: monorepo, appRoot: path.join(root, 'apps', appId) };
  if (existsSync(standalone)) return { statePath: standalone, appRoot: root };
  return { statePath: monorepo, appRoot: path.join(root, 'apps', appId) }; // fallback (will error on read)
}

function loadRegistry() {
  // Stage -> platform skills manifest. A missing or malformed registry degrades
  // the prompt (no SUGGESTED SKILLS section); it never fails a lifecycle run.
  try {
    const raw = readFileSync(path.join(__dirname, '../../../skill-registry.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.stages ? parsed : { stages: {} };
  } catch {
    return { stages: {} };
  }
}

function nextStage(state) {
  for (const stageName of STAGE_ORDER) {
    const entry = state.stages.find((s) => s.stage === stageName);
    if (!entry) continue;
    if (OWNER_GATED.has(stageName)) {
      // If owner-gated and not yet decided, report it but don't block non-gated stages.
      if (entry.state !== 'verified' && entry.state !== 'owner_gated_not_pursued') {
        // Return it so the caller knows about the gate, but mark it as gated.
        return { ...entry, _owner_gated: true };
      }
      continue;
    }
    if (entry.state === 'verified' || entry.state === 'owner_gated_not_pursued') continue;
    return entry;
  }
  return null;
}

function buildOwnerGateNotice(appId, stageEntry) {
  return `
OWNER ACTION REQUIRED — stage: ${stageEntry.stage.toUpperCase()}
App: ${appId}

This stage requires explicit owner approval and external access proof before
it can proceed. The lifecycle loop cannot advance past this point automatically.

What is needed:
  - Owner approval record in proof/${stageEntry.stage}-approval.json
  - External provider access confirmed (e.g. hosting, DNS, payment processor)

Once the owner has approved, update lifecycle-state.json:
  "${stageEntry.stage}": { "state": "verified", "eval_result_ref": "proof/${stageEntry.stage}-eval-result.json" }

Or, if the owner explicitly chooses not to pursue this stage:
  "${stageEntry.stage}": { "state": "owner_gated_not_pursued" }

Then re-run the lifecycle runner to continue.
`.trim();
}

function needsIntake(state, appRoot) {
  // Guided mode runs a pre-intent extraction phase before the lifecycle proper.
  // `pre-intent` has no entry in STAGE_ORDER or in the state file's `stages`
  // array, so this gate cannot live in nextStage/buildStagePrompt — there is no
  // stage entry to hang it on. intake.json existing is what closes the gate.
  if ((state.mode ?? 'loop') !== 'guided') return false;
  const intent = state.stages?.find((s) => s.stage === 'intent');
  if (intent?.state === 'verified') return false;
  return !existsSync(path.join(appRoot, 'lifecycle', 'intake.json'));
}

function buildIntakePrompt(appId, appRoot, registry) {
  const intakeRef = path.join(appRoot, 'lifecycle', 'intake.json').replace(/\\/g, '/');
  const skills = registry.stages?.['pre-intent'] ?? [];

  return `
WEAVE APPLICATION LIFECYCLE — PHASE: PRE-INTENT (guided mode)
App: ${appId}

GOAL
Turn the owner's shallow prompt into a brand vision, one specific target
customer, success criteria, and a visual direction — before any file is written.

BEFORE ACTING
1. Read packages/weave-tool/skills/weave-guided-intake/SKILL.md and follow it.
${skills.length ? skills.map((s, i) => `${i + 2}. Invoke the ${s} skill as that procedure directs.`).join('\n') : ''}

WHAT TO PRODUCE
${intakeRef} — schema weave-guided-intake/v1, every required field non-empty,
plus a populated intent.json and an owner-confirmed readback.

HOW TO CLOSE
Writing ${intakeRef} closes this gate. Re-run the lifecycle runner to get the
INTENT stage prompt.

RULES
- One specific person, never a segment.
- Do not write any application file during intake — intake.json and intent.json only.
- Every field must trace to an owner answer. Do not invent brand vision or
  success criteria the owner did not confirm.
`.trim();
}

function buildStagePrompt(appId, appRoot, stageEntry, state, registry) {
  const stage = stageEntry.stage;
  const evalRef = `packages/weave-tool/evals/lifecycle/${stage}.yaml`;
  const procRef = path.join(appRoot, 'lifecycle', stage, 'procedure.md').replace(/\\/g, '/');
  const stateRef = path.join(appRoot, 'lifecycle', 'lifecycle-state.json').replace(/\\/g, '/');

  const skills = registry.stages?.[stage] ?? [];
  const skillsSection = skills.length
    ? `
SUGGESTED SKILLS
${skills.map((s) => `- ${s}`).join('\n')}
`
    : '';

  // Guided mode grills the owner for depth before stage work begins. Loop mode
  // assumes the owner already has the answers and runs the stage directly.
  const guidedSection = (state.mode ?? 'loop') === 'guided'
    ? `
GUIDED MODE — GRILL FIRST
Before doing any stage work, invoke grill-me with questions specific to this
stage's goal above. Do not accept a vague answer where a specific one is needed,
and do not start the work until each branch is resolved. Carry the answers into
the proof artifact.
`
    : '';

  return `
WEAVE APPLICATION LIFECYCLE — STAGE: ${stage.toUpperCase()}
App: ${appId}
Lifecycle state: ${stateRef}

GOAL
${STAGE_GOAL[stage] ?? 'Advance through this lifecycle stage.'}

BEFORE ACTING
1. Read ${stateRef}
2. Read ${evalRef}
3. If it exists, read ${procRef}

WHAT TO PRODUCE
${STAGE_PROOF[stage] ?? `proof/${stage}-eval-result.json`}
${guidedSection}${skillsSection}
HOW TO CLOSE
After completing the stage work and writing proof:
1. Update lifecycle-state.json — set stage "${stage}" to:
   { "state": "verified", "eval_result_ref": "<proof path>", "eval_score_percent": <score> }
2. Re-run the lifecycle runner to get the next stage prompt:
   node packages/weave-tool/skills/weave-application-lifecycle/runner/lifecycle-runner.mjs \\
     --app ${appId} --root <repo-root>

RULES
- Do not claim a stage is complete without a proof artifact on disk.
- Record non-claims whenever this stage proves less than it appears to.
- Stop if the work requires credentials, live systems, or real payments not
  already authorized by the owner.
`.trim();
}

function checkProofIntegrity(state, root, appRoot) {
  // Fails closed: a stage marked `verified` whose `eval_result_ref` points at a
  // file that does not exist is an integrity failure, not a completed stage.
  // Stages with no eval_result_ref (e.g. iteration/analysis whose proof lives
  // elsewhere) are out of scope for this check.
  const missing = [];
  for (const entry of state.stages ?? []) {
    if (entry.state !== 'verified') continue;
    const ref = entry.eval_result_ref;
    if (!ref) continue;
    const candidates = [path.join(root, ref), path.join(appRoot, ref)];
    if (!candidates.some((p) => existsSync(p))) missing.push({ stage: entry.stage, ref });
  }
  return missing;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.app || !args.root) {
    console.error('usage: lifecycle-runner.mjs --app <app-id> --root <path-to-repo>');
    process.exitCode = 1;
    return;
  }

  const root = path.resolve(args.root);
  const { statePath, appRoot } = resolveStatePath(root, args.app);

  let state;
  try {
    state = JSON.parse(readFileSync(statePath, 'utf8'));
  } catch {
    console.error(`lifecycle-state.json not found at ${statePath}`);
    console.error(`Create it from the template:`);
    console.error(`  packages/weave-tool/skills/weave-application-lifecycle/templates/lifecycle-state.template.json`);
    process.exitCode = 1;
    return;
  }

  const missingProof = checkProofIntegrity(state, root, appRoot);
  if (missingProof.length) {
    console.error('PROOF MISSING — lifecycle integrity check failed (fails closed).');
    for (const m of missingProof) {
      console.error(`  stage "${m.stage}" is marked verified but its proof is absent: ${m.ref}`);
    }
    console.error('Restore the proof artifact, or clear the stage\'s verified state, before advancing.');
    process.exitCode = 1;
    return;
  }

  const registry = loadRegistry();

  if (needsIntake(state, appRoot)) {
    console.log(buildIntakePrompt(args.app, appRoot, registry));
    return;
  }

  const next = nextStage(state);

  if (!next) {
    console.log(`ALL STAGES COMPLETE — ${args.app} is ready to seal and close.`);
    return;
  }

  if (next._owner_gated) {
    console.log(buildOwnerGateNotice(args.app, next));
    return;
  }

  console.log(buildStagePrompt(args.app, appRoot, next, state, registry));
}

main();

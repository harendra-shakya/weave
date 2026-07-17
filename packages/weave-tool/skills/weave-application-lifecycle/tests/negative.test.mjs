import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_MD = path.join(__dirname, '../SKILL.md');
const RUNNER = path.join(__dirname, '../runner/lifecycle-runner.mjs');
const TEMPLATE = path.join(__dirname, '../templates/lifecycle-state.template.json');
const REGISTRY = path.join(__dirname, '../../../skill-registry.json');

const STAGE_ORDER = [
  'intent', 'research', 'selection', 'plan', 'engineering',
  'qa', 'deployment', 'kpi-setup', 'marketing', 'iteration', 'analysis',
];
const OWNER_GATED = new Set(['deployment', 'marketing']);

// -- skill package integrity --------------------------------------------------

test('skill: SKILL.md exists', () => {
  assert.ok(existsSync(SKILL_MD));
});

test('skill: SKILL.md has generic description (no commerce-specific terms)', () => {
  const content = readFileSync(SKILL_MD, 'utf8');
  assert.ok(content.includes('name: weave-application-lifecycle'));
  // Must not be locked to commerce
  assert.ok(!content.includes('commerce app'), 'description should not say "commerce app"');
  assert.ok(!content.includes('catalog'), 'should not reference catalog');
  assert.ok(!content.includes('cohort-runner'), 'should not reference cohort-runner');
  assert.ok(!content.includes('ATM-41'), 'should not reference sprint issue numbers');
});

test('skill: SKILL.md covers all 11 stages', () => {
  const content = readFileSync(SKILL_MD, 'utf8');
  for (const stage of STAGE_ORDER) {
    assert.ok(content.includes(stage), `missing stage: ${stage}`);
  }
});

test('skill: SKILL.md describes owner-gated stages', () => {
  const content = readFileSync(SKILL_MD, 'utf8');
  assert.ok(content.includes('owner-gated') || content.includes('owner gate'));
  assert.ok(content.includes('deployment'));
  assert.ok(content.includes('marketing'));
});

test('skill: SKILL.md declares both stop tokens by name', () => {
  // The generic rewrite dropped these literals; the concepts survived in prose
  // but nothing greppable did, which is how the gap went unnoticed. A stop that
  // cannot be found by name cannot be audited.
  const content = readFileSync(SKILL_MD, 'utf8');
  assert.ok(content.includes('ENGINEERING_REQUIRED'), 'SKILL.md must name the ENGINEERING_REQUIRED stop');
  assert.ok(content.includes('OWNER_GATE'), 'SKILL.md must name the OWNER_GATE stop');
});

test('skill: ENVELOPE.md records where the skill is actually proven', () => {
  // SKILL.md is deliberately generic. That is a claim about design, not
  // evidence — the envelope is what makes the boundary falsifiable.
  const envelope = path.join(__dirname, '../ENVELOPE.md');
  assert.ok(existsSync(envelope), 'ENVELOPE.md must exist');
  const content = readFileSync(envelope, 'utf8');
  assert.ok(content.includes('Validated envelope'), 'must state the validated envelope');
  assert.ok(/unproven, not broken/.test(content), 'must say what is outside the envelope');
  assert.ok(readFileSync(SKILL_MD, 'utf8').includes('ENVELOPE.md'), 'SKILL.md must link to it');
});

test('skill: runner exists', () => {
  assert.ok(existsSync(RUNNER));
});

test('skill: runner has no commerce-specific language', () => {
  const content = readFileSync(RUNNER, 'utf8');
  assert.ok(!content.includes('catalog'), 'runner should not reference catalog');
  assert.ok(!content.includes('cohort-runner'), 'runner should not reference cohort-runner');
  assert.ok(!content.includes('seeds.json'), 'runner should not reference seeds.json');
  assert.ok(!content.includes('sticker'), 'runner should not reference sticker');
  assert.ok(!content.includes('video-storefront'), 'runner should not reference video-storefront');
});

test('skill: template is valid JSON with all 11 stages', () => {
  const tmpl = JSON.parse(readFileSync(TEMPLATE, 'utf8'));
  assert.equal(tmpl.stages.length, 11);
  const names = tmpl.stages.map((s) => s.stage);
  for (const stage of STAGE_ORDER) {
    assert.ok(names.includes(stage), `missing stage: ${stage}`);
  }
});

test('skill: template all stages start as not_started', () => {
  const tmpl = JSON.parse(readFileSync(TEMPLATE, 'utf8'));
  for (const s of tmpl.stages) {
    assert.equal(s.state, 'not_started');
  }
});

// -- runner logic (inline re-implementation, no CLI call needed) --------------

function nextStage(state) {
  for (const stageName of STAGE_ORDER) {
    const entry = state.stages.find((s) => s.stage === stageName);
    if (!entry) continue;
    if (OWNER_GATED.has(stageName)) {
      if (entry.state !== 'verified' && entry.state !== 'owner_gated_not_pursued') {
        return { ...entry, _owner_gated: true };
      }
      continue;
    }
    if (entry.state === 'verified' || entry.state === 'owner_gated_not_pursued') continue;
    return entry;
  }
  return null;
}

test('runner: nextStage returns first not_started non-owner-gated stage', () => {
  const state = {
    stages: STAGE_ORDER.map((s) => ({ stage: s, state: 'not_started' })),
  };
  const next = nextStage(state);
  assert.equal(next.stage, 'intent');
  assert.equal(next._owner_gated, undefined);
});

test('runner: nextStage skips verified stages', () => {
  const state = {
    stages: STAGE_ORDER.map((s) => ({
      stage: s,
      state: s === 'intent' ? 'verified' : 'not_started',
    })),
  };
  assert.equal(nextStage(state).stage, 'research');
});

test('runner: nextStage flags owner-gated stages instead of skipping silently', () => {
  const allButDeployment = new Set(['intent', 'research', 'selection', 'plan', 'engineering', 'qa']);
  const state = {
    stages: STAGE_ORDER.map((s) => ({
      stage: s,
      state: allButDeployment.has(s) ? 'verified' : 'not_started',
    })),
  };
  const next = nextStage(state);
  assert.equal(next.stage, 'deployment');
  assert.equal(next._owner_gated, true);
});

test('runner: nextStage skips owner-gated if already owner_gated_not_pursued', () => {
  const state = {
    stages: STAGE_ORDER.map((s) => ({
      stage: s,
      state: OWNER_GATED.has(s) ? 'owner_gated_not_pursued'
           : ['intent', 'research', 'selection', 'plan', 'engineering', 'qa'].includes(s) ? 'verified'
           : 'not_started',
    })),
  };
  // deployment and marketing are owner_gated_not_pursued — next should be kpi-setup
  const next = nextStage(state);
  assert.equal(next.stage, 'kpi-setup');
});

test('runner: nextStage returns null when all stages are done', () => {
  const state = {
    stages: STAGE_ORDER.map((s) => ({
      stage: s,
      state: OWNER_GATED.has(s) ? 'owner_gated_not_pursued' : 'verified',
    })),
  };
  assert.equal(nextStage(state), null);
});

// -- mode routing (spawns the real CLI, not a re-implementation) --------------

// The nextStage tests above re-implement the runner's logic inline, so they
// cannot catch a regression in the runner itself. Mode routing is exactly where
// that matters, so these drive the actual binary against a fixture app.
function runFixture(state, { intake = false } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'weave-lifecycle-'));
  const lifecycleDir = path.join(root, 'apps', 'demo', 'lifecycle');
  mkdirSync(lifecycleDir, { recursive: true });
  writeFileSync(path.join(lifecycleDir, 'lifecycle-state.json'), JSON.stringify(state));
  if (intake) writeFileSync(path.join(lifecycleDir, 'intake.json'), '{}');
  return execFileSync('node', [RUNNER, '--app', 'demo', '--root', root], { encoding: 'utf8' });
}

const freshState = (extra = {}) => ({
  app_id: 'demo',
  stages: STAGE_ORDER.map((s) => ({ stage: s, state: 'not_started' })),
  ...extra,
});

test('mode: guided with no intake.json routes to pre-intent, not the intent stage', () => {
  const out = runFixture(freshState({ mode: 'guided' }));
  assert.match(out, /PHASE: PRE-INTENT/);
  assert.match(out, /weave-guided-intake/);
  assert.ok(!out.includes('STAGE: INTENT'), 'must not emit the intent stage prompt');
});

test('mode: guided with intake.json present advances to the intent stage', () => {
  const out = runFixture(freshState({ mode: 'guided' }), { intake: true });
  assert.match(out, /STAGE: INTENT/);
  assert.ok(!out.includes('PRE-INTENT'), 'intake exists — the gate is closed');
});

test('mode: guided intent stage prompt grills before working', () => {
  const out = runFixture(freshState({ mode: 'guided' }), { intake: true });
  assert.match(out, /GUIDED MODE — GRILL FIRST/);
  assert.match(out, /grill-me/);
});

test('mode: absent defaults to loop — no pre-intent gate, no grill', () => {
  const out = runFixture(freshState());
  assert.match(out, /STAGE: INTENT/);
  assert.ok(!out.includes('PRE-INTENT'), 'loop mode must not gate on intake');
  assert.ok(!out.includes('GRILL FIRST'), 'loop mode must not grill');
});

test('mode: explicit loop behaves as absent mode', () => {
  // Each run gets its own tmpdir, so normalize the fixture root out of the paths.
  const norm = (s) => s.replace(/weave-lifecycle-\w+/g, 'ROOT');
  assert.equal(norm(runFixture(freshState({ mode: 'loop' }))), norm(runFixture(freshState())));
});

test('mode: guided does not gate once intent is already verified', () => {
  const state = freshState({ mode: 'guided' });
  state.stages[0].state = 'verified';
  const out = runFixture(state);
  assert.ok(!out.includes('PRE-INTENT'), 'intent is done — intake is moot');
  assert.match(out, /STAGE: RESEARCH/);
});

// -- proof integrity: the runner must fail CLOSED ------------------------------

// This is the whole point of the skill. The runner originally failed OPEN: a
// lifecycle-state.json with every stage self-attested "verified" and zero proof
// on disk printed ALL STAGES COMPLETE and exited 0 — a ghost app passing as a
// sealed one. The fix shipped without a test, which is the same class of gap
// that allowed it. These drive the real binary.
function runFixtureExpectingFailure(state, { proofFiles = [] } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'weave-lifecycle-'));
  const appRoot = path.join(root, 'apps', 'demo');
  mkdirSync(path.join(appRoot, 'lifecycle'), { recursive: true });
  writeFileSync(path.join(appRoot, 'lifecycle', 'lifecycle-state.json'), JSON.stringify(state));
  for (const rel of proofFiles) {
    const abs = path.join(appRoot, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, '{}');
  }
  try {
    const stdout = execFileSync('node', [RUNNER, '--app', 'demo', '--root', root], { encoding: 'utf8' });
    return { code: 0, out: stdout };
  } catch (err) {
    return { code: err.status, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

const ghostState = (extra = {}) => ({
  app_id: 'demo',
  stages: STAGE_ORDER.map((s) => ({
    stage: s,
    state: OWNER_GATED.has(s) ? 'owner_gated_not_pursued' : 'verified',
    ...(OWNER_GATED.has(s) ? {} : { eval_result_ref: `proof/${s}-eval-result.json` }),
  })),
  ...extra,
});

test('proof: ghost app — all stages verified, zero proof on disk — fails closed', () => {
  const { code, out } = runFixtureExpectingFailure(ghostState());
  assert.equal(code, 1, 'must exit non-zero');
  assert.match(out, /PROOF MISSING/);
  assert.ok(!out.includes('ALL STAGES COMPLETE'), 'a ghost app must never report completion');
});

test('proof: failure names every stage whose proof is absent', () => {
  const { out } = runFixtureExpectingFailure(ghostState());
  // Naming one stage and stopping would let the operator fix them one at a time
  // without ever seeing the scale of the problem.
  for (const stage of STAGE_ORDER.filter((s) => !OWNER_GATED.has(s))) {
    assert.ok(out.includes(`"${stage}"`), `must name the stage with missing proof: ${stage}`);
  }
});

test('proof: a single missing artifact is enough to fail — not a majority vote', () => {
  const nonGated = STAGE_ORDER.filter((s) => !OWNER_GATED.has(s));
  const allButOne = nonGated.slice(0, -1).map((s) => `proof/${s}-eval-result.json`);
  const { code, out } = runFixtureExpectingFailure(ghostState(), { proofFiles: allButOne });
  assert.equal(code, 1, '8 of 9 proofs present must still fail');
  assert.match(out, /PROOF MISSING/);
  assert.ok(out.includes(`"${nonGated.at(-1)}"`), 'must name the one missing stage');
});

test('proof: complete proof on disk passes the integrity check', () => {
  // The check must fail closed without failing *always* — a gate that never
  // opens teaches operators to bypass it.
  const proofFiles = STAGE_ORDER.filter((s) => !OWNER_GATED.has(s)).map((s) => `proof/${s}-eval-result.json`);
  const { code, out } = runFixtureExpectingFailure(ghostState(), { proofFiles });
  assert.equal(code, 0, 'complete proof must pass');
  assert.ok(!out.includes('PROOF MISSING'));
  assert.match(out, /ALL STAGES COMPLETE/);
});

test('proof: a verified stage with no eval_result_ref is out of scope, not a pass', () => {
  // Documents the deliberate hole: the check only validates refs that exist.
  // A stage claiming verified with no ref at all is invisible to it.
  const state = {
    app_id: 'demo',
    stages: STAGE_ORDER.map((s) => ({
      stage: s,
      state: OWNER_GATED.has(s) ? 'owner_gated_not_pursued' : 'verified',
    })),
  };
  const { code } = runFixtureExpectingFailure(state);
  assert.equal(code, 0, 'known limitation: no ref means nothing to check against');
});

// -- skill registry ------------------------------------------------------------

test('registry: stage prompt names the stage\'s platform skills', () => {
  const out = runFixture(freshState());
  assert.match(out, /SUGGESTED SKILLS/);
  assert.match(out, /- to-prd/); // registry: intent -> [grill-me, to-prd]
});

test('registry: is valid JSON and its stage keys are all real stages or pre-intent', () => {
  const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));
  const allowed = new Set([...STAGE_ORDER, 'pre-intent']);
  for (const key of Object.keys(registry.stages)) {
    assert.ok(allowed.has(key), `registry names an unknown stage: ${key}`);
    assert.ok(registry.stages[key].length > 0, `registry key has no skills: ${key}`);
  }
});

test('template: declares loop mode by default', () => {
  const tmpl = JSON.parse(readFileSync(TEMPLATE, 'utf8'));
  assert.equal(tmpl.mode, 'loop');
});

// -- lifecycle invariants ------------------------------------------------------

test('invariant: no stage can be verified without a prior stage being verified', () => {
  // Enforce: verification order must follow STAGE_ORDER (excluding owner-gated).
  // Simulate a state where engineering is verified but plan is not — illegal.
  const state = {
    stages: STAGE_ORDER.map((s) => ({
      stage: s,
      state: s === 'engineering' ? 'verified' : 'not_started',
    })),
  };
  // nextStage returns intent (first unverified) — it would not skip to engineering.
  const next = nextStage(state);
  assert.equal(next.stage, 'intent'); // not engineering
});

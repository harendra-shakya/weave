// Fail-closed proof for tools/validate-lifecycle.mjs.
//
//   node --test tests/negative.test.mjs
//
// (Glob/explicit form, not a directory argument — `node --test <dir>` is unreliable on the
// Windows runner. Recorded as an intervention in the ATM-416 foundation ledger.)
//
// Each negative fixture is built by mutating ONE thing in a known-good state file. If the
// validator returns zero errors for any of them, it is not failing closed and the skill's
// central acceptance gate is broken.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { validateLifecycle } from '../tools/validate-lifecycle.mjs';

const STAGES = [
  'intent', 'research', 'selection', 'plan', 'engineering',
  'qa', 'deployment', 'kpi-setup', 'marketing', 'iteration', 'analysis',
];

const SYNTHETIC_NONCLAIM =
  'Synthetic cohort only — these KPIs do not prove real demand, real conversion, '
  + 'or real financial performance.';

/** A state file that must validate clean. Every fixture below is this, minus one thing. */
function goodState() {
  return {
    schema: 'weave-cos-lifecycle/v0.1',
    app_id: 'fixture-app',
    current_stage: 'sealed',
    mode: 'loop',
    stages: STAGES.map((stage) => {
      if (stage === 'deployment' || stage === 'marketing') {
        return { stage, state: 'owner_gated_skipped', reason: 'no provider access' };
      }
      return { stage, state: 'verified', eval_result_ref: `proof/${stage}-eval-result.json` };
    }),
    non_claims: [SYNTHETIC_NONCLAIM, 'does not prove real payment processing'],
    updated_at: '2026-07-24T00:00:00.000Z',
  };
}

/** Materialise a state file plus the proof artifacts and ledger it claims. */
function makeApp(state, { withProof = true, withLedger = true, cohortRuns = 2 } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'weave-lifecycle-'));
  const appRoot = path.join(root, 'apps', 'fixture-app');
  mkdirSync(path.join(appRoot, 'lifecycle'), { recursive: true });
  mkdirSync(path.join(appRoot, 'proof'), { recursive: true });

  if (withProof) {
    for (const entry of state.stages ?? []) {
      const ref = entry.eval_result_ref ?? entry.proof_ref ?? entry.cohort_ref;
      if (!ref) continue;
      const full = path.join(appRoot, ref);
      mkdirSync(path.dirname(full), { recursive: true });
      writeFileSync(full, JSON.stringify({ stage: entry.stage, state: entry.state }));
    }
  }
  if (withLedger) writeFileSync(path.join(appRoot, 'INTERVENTION_LEDGER.md'), '# Ledger\n\nNone.\n');

  for (let i = 0; i < cohortRuns; i += 1) {
    mkdirSync(path.join(appRoot, 'proof', `cohort-run-${i}`), { recursive: true });
  }

  const statePath = path.join(appRoot, 'lifecycle', 'lifecycle-state.json');
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  return { root, appRoot, statePath, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function run(state, opts) {
  const app = makeApp(state, opts);
  try {
    return validateLifecycle({ statePath: app.statePath, appRoot: app.appRoot, root: app.root });
  } finally {
    app.cleanup();
  }
}

// -- The positive control ----------------------------------------------------
// If this fails, every negative result below is meaningless.

test('positive control: a complete, honest record validates clean', () => {
  const { errors } = run(goodState());
  assert.deepEqual(errors, [], `expected no errors, got:\n${errors.join('\n')}`);
});

// -- Fail-closed fixtures ----------------------------------------------------

test('FAILS CLOSED: a verified stage whose proof file is absent from disk', () => {
  const { errors } = run(goodState(), { withProof: false });
  assert.ok(errors.length > 0, 'missing proof on disk must be an error');
  assert.ok(errors.some((e) => /proof is absent/.test(e)), errors.join('\n'));
});

test('FAILS CLOSED: a verified stage that names no proof at all', () => {
  const state = goodState();
  delete state.stages.find((s) => s.stage === 'qa').eval_result_ref;
  const { errors } = run(state);
  assert.ok(errors.some((e) => /verified but names no proof/.test(e)), errors.join('\n'));
});

test('FAILS CLOSED: the synthetic-only nonclaim is stripped', () => {
  const state = goodState();
  state.non_claims = ['does not prove real payment processing'];
  const { errors } = run(state);
  assert.ok(errors.some((e) => /missing the required synthetic-only nonclaim/.test(e)),
    errors.join('\n'));
});

test('FAILS CLOSED: the synthetic nonclaim is softened rather than removed', () => {
  // The interesting attack: keep something that reads like a disclaimer, weaken what it says.
  const state = goodState();
  state.non_claims = ['synthetic cohort results are indicative of real demand'];
  const { errors } = run(state);
  assert.ok(errors.some((e) => /not the required literal/.test(e)), errors.join('\n'));
});

test('FAILS CLOSED: an unknown stage state', () => {
  const state = goodState();
  state.stages.find((s) => s.stage === 'analysis').state = 'looks_fine';
  const { errors } = run(state);
  assert.ok(errors.some((e) => /invalid state "looks_fine"/.test(e)), errors.join('\n'));
});

test('FAILS CLOSED: a missing stage', () => {
  const state = goodState();
  state.stages = state.stages.filter((s) => s.stage !== 'iteration');
  const { errors } = run(state);
  assert.ok(errors.some((e) => /missing stage: iteration/.test(e)), errors.join('\n'));
});

test('FAILS CLOSED: no INTERVENTION_LEDGER.md while stages are verified (D3)', () => {
  const { errors } = run(goodState(), { withLedger: false });
  assert.ok(errors.some((e) => /intervention count is unrecorded, not zero/.test(e)),
    errors.join('\n'));
});

test('FAILS CLOSED: a baseline cohort run under a null frozen_at_commit (D1)', () => {
  const state = goodState();
  const app = makeApp(state);
  try {
    mkdirSync(path.join(app.root, 'contracts'), { recursive: true });
    writeFileSync(
      path.join(app.root, 'contracts', 'freeze-digests.json'),
      JSON.stringify({ apps: { 'fixture-app': { frozen_at_commit: null, baseline_run_ref: null } } }),
    );
    const { errors } = validateLifecycle({
      statePath: app.statePath, appRoot: app.appRoot, root: app.root,
    });
    assert.ok(errors.some((e) => /frozen_at_commit is null/.test(e)), errors.join('\n'));
    assert.ok(errors.some((e) => /baseline_run_ref is null/.test(e)), errors.join('\n'));
  } finally {
    app.cleanup();
  }
});

test('FAILS CLOSED: verdict GO recorded on a zero delta (D7)', () => {
  const state = goodState();
  const iteration = state.stages.find((s) => s.stage === 'iteration');
  iteration.verdict = 'GO';

  const app = makeApp(state);
  try {
    writeFileSync(
      path.join(app.appRoot, iteration.eval_result_ref),
      JSON.stringify({
        delta_vs_baseline: { conversion_rate_delta: 0, aov_delta_dollars: 0 },
      }),
    );
    const { errors } = validateLifecycle({
      statePath: app.statePath, appRoot: app.appRoot, root: app.root,
    });
    assert.ok(errors.some((e) => /verdict GO but every measured delta is <= 0/.test(e)),
      errors.join('\n'));
  } finally {
    app.cleanup();
  }
});

test('does NOT fire: verdict GO on a positive delta is legitimate', () => {
  const state = goodState();
  const iteration = state.stages.find((s) => s.stage === 'iteration');
  iteration.verdict = 'GO';

  const app = makeApp(state);
  try {
    writeFileSync(
      path.join(app.appRoot, iteration.eval_result_ref),
      JSON.stringify({ delta_vs_baseline: { conversion_rate_delta: 0.02 } }),
    );
    const { errors } = validateLifecycle({
      statePath: app.statePath, appRoot: app.appRoot, root: app.root,
    });
    assert.deepEqual(errors, [], errors.join('\n'));
  } finally {
    app.cleanup();
  }
});

// -- Stop conditions are testable, not just documented -----------------------

test('ENGINEERING_REQUIRED is a recordable state and must name its reason', () => {
  const state = goodState();
  const eng = state.stages.find((s) => s.stage === 'engineering');
  eng.state = 'engineering_required';
  delete eng.eval_result_ref;

  const bare = run(state);
  assert.ok(bare.errors.some((e) => /stopped \(ENGINEERING_REQUIRED\)/.test(e)),
    'a stop with no reason must be rejected');

  eng.reason = 'checkout adapter requires a schema migration the lifecycle cannot produce';
  const named = run(state);
  assert.deepEqual(named.errors, [], named.errors.join('\n'));
});

test('OWNER_GATE is a recordable state and must name its reason', () => {
  const state = goodState();
  const dep = state.stages.find((s) => s.stage === 'deployment');
  dep.state = 'owner_gate_blocked';
  delete dep.reason;

  const bare = run(state);
  assert.ok(bare.errors.some((e) => /stopped \(OWNER_GATE\)/.test(e)),
    'a stop with no reason must be rejected');

  dep.blocked_by = 'OWNER_GATE';
  const named = run(state);
  assert.deepEqual(named.errors, [], named.errors.join('\n'));
});

test('a non-gated stage cannot claim an owner-gated skip', () => {
  const state = goodState();
  const qa = state.stages.find((s) => s.stage === 'qa');
  qa.state = 'owner_gated_skipped';
  qa.reason = 'skipped';
  delete qa.eval_result_ref;

  const { errors } = run(state);
  assert.ok(errors.some((e) => /is not an owner-gated stage/.test(e)), errors.join('\n'));
});

// -- Portability (ENVELOPE.md gap 1) -----------------------------------------

test('resolves an app in a different repo from the skill', async () => {
  const { resolveApp } = await import('../tools/validate-lifecycle.mjs');
  const { statePath } = resolveApp(path.join('X:', 'elsewhere', 'other-repo'), 'some-app');
  assert.ok(statePath.includes('other-repo'),
    'paths must resolve from --root, never from the skill directory');
  assert.ok(!statePath.includes('weave-application-lifecycle'),
    'the skill directory must never leak into a resolved app path');
});

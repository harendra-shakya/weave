import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from '../tools/validate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VALIDATE  = path.join(__dirname, '../tools/validate.mjs');
const SEAL      = path.join(__dirname, '../tools/seal.mjs');
const KPI_CMP   = path.join(__dirname, '../tools/kpi-compare.mjs');
const GEN       = path.join(__dirname, '../tools/generate-events.mjs');

function tmpFile(content, name = 'state.json') {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'weave-tools-'));
  const fp  = path.join(dir, name);
  writeFileSync(fp, typeof content === 'string' ? content : JSON.stringify(content));
  return { fp, dir };
}

function run(bin, args) {
  try {
    return { code: 0, out: execFileSync('node', [bin, ...args], { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

const STAGE_ORDER = [
  'intent', 'research', 'selection', 'plan', 'engineering',
  'qa', 'deployment', 'kpi-setup', 'marketing', 'iteration', 'analysis',
];
const OWNER_GATED = new Set(['deployment', 'marketing']);

function validState(overrides = {}) {
  return {
    app_id: 'test-app',
    schema: 'weave-cos-lifecycle/v0.1',
    stages: STAGE_ORDER.map((s) => ({ stage: s, state: 'not_started' })),
    ...overrides,
  };
}

// -- validate: module API (no CLI round-trip needed for fast cases) -----------

test('validate: valid state with all stages passes', () => {
  const { fp } = tmpFile(validState());
  const { errors } = validate(fp);
  assert.equal(errors.length, 0);
});

test('validate: missing app_id is an error', () => {
  const s = validState(); delete s.app_id;
  const { fp } = tmpFile(s);
  const { errors } = validate(fp);
  assert.ok(errors.some((e) => e.includes('app_id')));
});

test('validate: missing schema is an error', () => {
  const s = validState(); delete s.schema;
  const { fp } = tmpFile(s);
  const { errors } = validate(fp);
  assert.ok(errors.some((e) => e.includes('schema')));
});

test('validate: missing stages array is an error', () => {
  const s = validState(); delete s.stages;
  const { fp } = tmpFile(s);
  const { errors } = validate(fp);
  assert.ok(errors.some((e) => e.includes('stages')));
});

test('validate: missing a stage is an error', () => {
  const s = validState();
  s.stages = s.stages.filter((st) => st.stage !== 'qa');
  const { fp } = tmpFile(s);
  const { errors } = validate(fp);
  assert.ok(errors.some((e) => e.includes('qa')));
});

test('validate: invalid state value is an error', () => {
  const s = validState();
  s.stages[0].state = 'done'; // not a valid state
  const { fp } = tmpFile(s);
  const { errors } = validate(fp);
  assert.ok(errors.some((e) => e.includes('done')));
});

test('validate: verified without eval_result_ref is a warning, not error', () => {
  const s = validState();
  s.stages[0] = { stage: 'intent', state: 'verified' }; // no eval_result_ref
  const { fp } = tmpFile(s);
  const { errors, warnings } = validate(fp);
  assert.equal(errors.length, 0, 'should not be an error');
  assert.ok(warnings.some((w) => w.includes('intent')), 'should be a warning');
});

test('validate: not-JSON file is an error', () => {
  const { fp } = tmpFile('not json at all', 'bad.json');
  const { errors } = validate(fp);
  assert.ok(errors.some((e) => e.includes('JSON')));
});

// -- validate: CLI exits correctly (drives the real binary) ------------------

test('validate CLI: exits 0 on valid file', () => {
  const { fp } = tmpFile(validState());
  const { code } = run(VALIDATE, [fp]);
  assert.equal(code, 0);
});

test('validate CLI: exits 1 on invalid file', () => {
  const s = validState(); delete s.app_id;
  const { fp } = tmpFile(s);
  const { code } = run(VALIDATE, [fp]);
  assert.equal(code, 1);
});

// -- seal --------------------------------------------------------------------

test('seal: creates a manifest with correct file count', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'weave-seal-'));
  writeFileSync(path.join(dir, 'a.txt'), 'hello');
  writeFileSync(path.join(dir, 'b.txt'), 'world');
  const sub = path.join(dir, 'sub');
  mkdirSync(sub);
  writeFileSync(path.join(sub, 'c.txt'), 'nested');

  const { code } = run(SEAL, ['--dir', dir]);
  assert.equal(code, 0);

  const manifest = JSON.parse(readFileSync(path.join(dir, 'seal-manifest.json'), 'utf8'));
  assert.equal(manifest.file_count, 3, 'a.txt + b.txt + sub/c.txt');
  assert.ok(manifest.files.every((f) => f.sha256.length === 64), 'all sha256 hashes are 64 hex chars');
});

test('seal: seal-manifest.json is excluded from its own manifest', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'weave-seal-'));
  writeFileSync(path.join(dir, 'proof.json'), '{}');
  run(SEAL, ['--dir', dir]);
  const manifest = JSON.parse(readFileSync(path.join(dir, 'seal-manifest.json'), 'utf8'));
  assert.ok(!manifest.files.some((f) => f.path === 'seal-manifest.json'), 'manifest must not list itself');
});

test('seal: same directory produces same sha256 hashes', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'weave-seal-'));
  writeFileSync(path.join(dir, 'data.json'), JSON.stringify({ value: 42 }));
  run(SEAL, ['--dir', dir]);
  const m1 = JSON.parse(readFileSync(path.join(dir, 'seal-manifest.json'), 'utf8'));
  run(SEAL, ['--dir', dir]); // re-seal
  const m2 = JSON.parse(readFileSync(path.join(dir, 'seal-manifest.json'), 'utf8'));
  assert.equal(m1.files[0].sha256, m2.files[0].sha256, 'hash must be stable across runs');
});

// -- kpi-compare -------------------------------------------------------------

test('kpi-compare: reports delta for matching numeric fields', () => {
  const { fp: b } = tmpFile({ conversion_rate: 0.30, aov: 50.00 }, 'baseline.json');
  const { fp: c } = tmpFile({ conversion_rate: 0.33, aov: 55.00 }, 'current.json');
  const { code, out } = run(KPI_CMP, ['--baseline', b, '--current', c]);
  assert.equal(code, 0);
  assert.ok(out.includes('conversion_rate'));
  assert.ok(out.includes('aov'));
  assert.ok(out.includes('+'), 'should show positive delta');
});

test('kpi-compare: handles fields present in only one side', () => {
  const { fp: b } = tmpFile({ metric_a: 1.0 }, 'base.json');
  const { fp: c } = tmpFile({ metric_b: 2.0 }, 'curr.json');
  const { code, out } = run(KPI_CMP, ['--baseline', b, '--current', c]);
  assert.equal(code, 0);
  assert.ok(out.includes('N/A'), 'missing values should show N/A');
});

// -- generate-events ---------------------------------------------------------

test('generate-events: produces deterministic output from a seed', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'weave-events-'));
  const out1 = path.join(dir, 'e1.json');
  const out2 = path.join(dir, 'e2.json');
  run(GEN, ['--seed', '42', '--count', '50', '--output', out1]);
  run(GEN, ['--seed', '42', '--count', '50', '--output', out2]);
  const a = readFileSync(out1, 'utf8');
  const b = readFileSync(out2, 'utf8');
  // event arrays must be identical; generated_at timestamps differ — compare only events
  const ea = JSON.parse(a).events;
  const eb = JSON.parse(b).events;
  assert.deepEqual(ea, eb, 'same seed must produce identical events');
});

test('generate-events: different seeds produce different outputs', () => {
  const dir  = mkdtempSync(path.join(os.tmpdir(), 'weave-events-'));
  const out1 = path.join(dir, 'e1.json');
  const out2 = path.join(dir, 'e2.json');
  run(GEN, ['--seed', '1',  '--count', '50', '--output', out1]);
  run(GEN, ['--seed', '99', '--count', '50', '--output', out2]);
  const ea = JSON.parse(readFileSync(out1, 'utf8')).events;
  const eb = JSON.parse(readFileSync(out2, 'utf8')).events;
  assert.notDeepEqual(ea, eb, 'different seeds must produce different events');
});

test('generate-events: event_count in manifest matches actual events array length', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'weave-events-'));
  const out = path.join(dir, 'events.json');
  run(GEN, ['--seed', '7', '--count', '100', '--output', out]);
  const result = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(result.event_count, result.events.length, 'manifest count must match array');
});

// -- examples: validate all three ------------------------------------------

test('examples: all three lifecycle-state.json examples pass schema validation', () => {
  const examples = [
    path.join(__dirname, '../examples/video-storefront/lifecycle-state.json'),
    path.join(__dirname, '../examples/sticker-storefront/lifecycle-state.json'),
    path.join(__dirname, '../examples/nft-storefront/lifecycle-state.json'),
  ];
  for (const fp of examples) {
    const { errors } = validate(fp);
    assert.equal(errors.length, 0, `${path.basename(path.dirname(fp))}: ${errors.join(', ')}`);
  }
});

// -- templates: valid JSON --------------------------------------------------

test('templates: all templates are valid JSON', () => {
  const templates = [
    'lifecycle-state.template.json',
    'analysis.template.json',
    'risk.template.json',
    'owner-readback.template.json',
    'cleanup.template.json',
  ].map((name) => path.join(__dirname, '../templates', name));

  for (const fp of templates) {
    assert.ok(existsSync(fp), `template missing: ${fp}`);
    assert.doesNotThrow(() => JSON.parse(readFileSync(fp, 'utf8')), `${path.basename(fp)} is not valid JSON`);
  }
});

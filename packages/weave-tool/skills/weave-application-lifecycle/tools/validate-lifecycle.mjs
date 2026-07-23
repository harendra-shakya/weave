#!/usr/bin/env node
// Validates an app's lifecycle record. FAILS CLOSED: missing proof is an error, never a warning.
//
//   node tools/validate-lifecycle.mjs --root <repo-containing-the-app> --app <app-id>
//   node tools/validate-lifecycle.mjs --state <path-to-lifecycle-state.json>   # fixtures
//
// Exits 0 only when every check passes. Exits 1 on any error.
//
// Portability (ENVELOPE.md gap 1): pure Node, no shell, no python, no platform assumption.
// Every path resolves from --root, never from this file's location — so the skill can live in
// one repo and validate apps in another. That cross-repo case is the one that has failed every
// previous time, so it is the case this tool is built for.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'schema', 'lifecycle-state.schema.json',
);

// The schema owns the vocabulary; this file only enforces it. Keeping the lists in one place is
// what stops the schema and the validator drifting the way the three sealed apps drifted (D5).
const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
const V = schema['x-weave'];

function readJSON(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

/** Resolve where the app lives. Supports <root>/apps/<id> and <root>/<id>. */
export function resolveApp(root, appId) {
  const candidates = [path.join(root, 'apps', appId), path.join(root, appId)];
  const appRoot = candidates.find((p) => existsSync(p)) ?? candidates[0];
  return { appRoot, statePath: path.join(appRoot, 'lifecycle', 'lifecycle-state.json') };
}

/**
 * @returns {{errors: string[], warnings: string[]}} — errors are exit-1 conditions.
 */
export function validateLifecycle({ statePath, appRoot, root }) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);

  if (!existsSync(statePath)) {
    return { errors: [`lifecycle-state.json not found: ${statePath}`], warnings };
  }

  const state = readJSON(statePath);
  if (!state) return { errors: [`lifecycle-state.json is not valid JSON: ${statePath}`], warnings };

  // -- 1. Required top-level fields ------------------------------------------
  for (const field of schema.required) {
    if (state[field] === undefined) err(`missing required field: ${field}`);
  }

  if (state.current_stage
      && !V.stage_order.includes(state.current_stage)
      && !V.terminal_stages.includes(state.current_stage)) {
    err(`current_stage "${state.current_stage}" is neither a stage nor a terminal marker `
      + `(${V.terminal_stages.join(' | ')})`);
  }

  // -- 2. Stage list: all 11, known names, known states -----------------------
  if (!Array.isArray(state.stages)) {
    err('stages must be an array');
    return { errors, warnings };
  }

  const present = state.stages.map((s) => s.stage);
  for (const name of V.stage_order) {
    if (!present.includes(name)) err(`missing stage: ${name}`);
  }

  const validStates = schema.$defs.stage_state.enum;
  let anyVerified = false;

  for (const entry of state.stages) {
    if (!entry.stage) { err('stage entry has no "stage" field'); continue; }
    if (!V.stage_order.includes(entry.stage)) err(`unknown stage name: "${entry.stage}"`);

    if (!entry.state) {
      err(`stage "${entry.stage}" has no "state" field`);
      continue;
    }
    if (!validStates.includes(entry.state)) {
      err(`stage "${entry.stage}" has invalid state "${entry.state}" `
        + `(valid: ${validStates.join(', ')})`);
      continue;
    }

    // -- 3. Fail closed on proof. A verified stage with no proof, or proof that is
    //       not on disk, is an integrity failure — not a warning to be read past.
    if (entry.state === 'verified') {
      anyVerified = true;
      const ref = V.proof_ref_fields.map((f) => entry[f]).find(Boolean);
      if (!ref) {
        err(`stage "${entry.stage}" is verified but names no proof `
          + `(one of: ${V.proof_ref_fields.join(', ')})`);
      } else {
        const found = [path.join(appRoot, ref), path.join(root, ref)].some((p) => existsSync(p));
        if (!found) err(`stage "${entry.stage}" is verified but its proof is absent: ${ref}`);
      }
    }

    // A stop must name which kind it is, or the next operator cannot act on it.
    const stopKind = V.stop_states[entry.state];
    if (stopKind && !entry.reason && !entry.blocked_by) {
      err(`stage "${entry.stage}" is stopped (${stopKind}) but records no "reason" or "blocked_by"`);
    }

    // A gated stage that was skipped must say why it was gated.
    if (V.gated_states.includes(entry.state) && !V.owner_gated_stages.includes(entry.stage)) {
      err(`stage "${entry.stage}" is marked ${entry.state} but is not an owner-gated stage `
        + `(${V.owner_gated_stages.join(', ')})`);
    }
  }

  // -- 4. The synthetic-only nonclaim, enforced as data ----------------------
  // Prose in a procedure cannot stop a synthetic KPI becoming a real-demand claim. A required
  // literal in the record can: the state file does not validate without it.
  const required = V.required_non_claim.text;
  const claims = Array.isArray(state.non_claims) ? state.non_claims : [];
  if (!claims.includes(required)) {
    const near = claims.find((c) => /synthetic/i.test(c));
    err(near
      ? `non_claims contains a synthetic disclaimer but not the required literal.\n`
        + `      found:    "${near}"\n`
        + `      required: "${required}"`
      : `non_claims is missing the required synthetic-only nonclaim:\n      "${required}"`);
  }

  // -- 5. Intervention ledger (D3) ------------------------------------------
  if (anyVerified) {
    const ledger = path.join(appRoot, V.intervention_ledger.filename);
    if (!existsSync(ledger)) {
      err(`${V.intervention_ledger.filename} is absent but stages are verified — `
        + `the intervention count is unrecorded, not zero`);
    }
  }

  // -- 6. Freeze contract (D1, D2) ------------------------------------------
  errors.push(...checkFreeze(state.app_id, appRoot, root));

  // -- 7. Verdict contract (D7) ---------------------------------------------
  errors.push(...checkVerdict(state, appRoot, root));

  // -- 8. Determinism (D4) — advisory; the record cannot say how many runs were intended
  const runs = cohortRuns(appRoot);
  if (runs.length === 1) {
    warnings.push('only one cohort run is on disk — determinism cannot be reproduced from the '
      + 'sealed artifacts alone (run the same seed twice and keep both)');
  }

  return { errors, warnings };
}

/** Cohort run directories under proof/. */
function cohortRuns(appRoot) {
  const proof = path.join(appRoot, 'proof');
  if (!existsSync(proof)) return [];
  return readdirSync(proof)
    .filter((d) => d.startsWith('cohort-'))
    .filter((d) => statSync(path.join(proof, d)).isDirectory());
}

/** A baseline run under a null freeze is invalid per the freeze contract's own governance. */
function checkFreeze(appId, appRoot, root) {
  const freezePath = path.join(root, V.freeze_contract.path);
  if (!existsSync(freezePath) || !appId) return [];

  const freeze = readJSON(freezePath);
  const entry = freeze?.apps?.[appId];
  if (!entry) return [];

  const runs = cohortRuns(appRoot);
  if (runs.length === 0) return [];

  const out = [];
  if (!entry.frozen_at_commit) {
    out.push(`${V.freeze_contract.path}: ${appId}.frozen_at_commit is null but ${runs.length} `
      + `baseline cohort run(s) exist — that file's own governance says such a baseline is invalid`);
  }
  if (!entry.baseline_run_ref) {
    out.push(`${V.freeze_contract.path}: ${appId}.baseline_run_ref is null — the freeze is not `
      + `linked to any run, so nothing ties the baseline to the code state it was measured against`);
  }
  return out;
}

/** GO requires the retest to beat the baseline. A zero delta is not a win. */
function checkVerdict(state, appRoot, root) {
  const iteration = state.stages?.find((s) => s.stage === 'iteration');
  if (!iteration) return [];

  // The verdict may live on the stage entry or inside the iteration proof — the sealed apps do both.
  const ref = V.proof_ref_fields.map((f) => iteration[f]).find(Boolean);
  const proof = ref
    ? [path.join(appRoot, ref), path.join(root, ref)].map(readJSON).find(Boolean)
    : null;

  const verdict = iteration.verdict ?? proof?.verdict ?? proof?.experiment_summary?.verdict;
  if (verdict !== 'GO') return [];

  const deltas = collectDeltas(proof);
  if (deltas.length === 0 || deltas.some((d) => d > 0)) return [];

  return [`iteration records verdict GO but every measured delta is <= 0 (${deltas.join(', ')}) — `
    + `${V.verdict_contract.path} verdict_rules require retest conversion_rate > baseline for GO`];
}

/** Numeric values under any key containing "delta", at any depth. */
function collectDeltas(node, out = []) {
  if (node === null || typeof node !== 'object') return out;
  for (const [k, v] of Object.entries(node)) {
    if (/delta/i.test(k) && typeof v === 'number') out.push(v);
    else collectDeltas(v, out);
  }
  return out;
}

// -- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  let target;

  if (args.state) {
    const statePath = path.resolve(args.state);
    const appRoot = path.resolve(path.dirname(statePath), '..');
    target = { statePath, appRoot, root: args.root ? path.resolve(args.root) : appRoot };
  } else if (args.root && args.app) {
    const root = path.resolve(args.root);
    target = { ...resolveApp(root, args.app), root };
  } else {
    console.error('usage: validate-lifecycle.mjs --root <repo> --app <app-id>');
    console.error('       validate-lifecycle.mjs --state <path-to-lifecycle-state.json>');
    process.exit(1);
  }

  const { errors, warnings } = validateLifecycle(target);
  const label = args.app ?? path.basename(target.appRoot);

  for (const w of warnings) console.warn(`  WARN  ${w}`);

  if (errors.length === 0) {
    console.log(`OK — ${label} (${errors.length} errors, ${warnings.length} warnings)`);
    process.exit(0);
  }

  console.error(`INVALID — ${label}`);
  for (const e of errors) console.error(`  ERROR ${e}`);
  console.error(`\n${errors.length} error(s). Lifecycle record is not valid; nothing downstream `
    + `of it can be trusted.`);
  process.exit(1);
}

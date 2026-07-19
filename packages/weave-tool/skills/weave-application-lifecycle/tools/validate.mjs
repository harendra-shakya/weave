#!/usr/bin/env node
// Validates a lifecycle-state.json against the schema requirements.
// Usage: node validate.mjs <path-to-lifecycle-state.json>
// Exits 0 if valid, 1 if invalid.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const STAGE_ORDER = [
  'intent', 'research', 'selection', 'plan', 'engineering',
  'qa', 'deployment', 'kpi-setup', 'marketing', 'iteration', 'analysis',
];

const VALID_STATES = new Set([
  'not_started', 'in_progress', 'verified', 'owner_gated_not_pursued', 'engineering_required',
]);

export function validate(filePath) {
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return { errors: [`cannot read file: ${filePath}`], warnings: [] };
  }

  let state;
  try {
    state = JSON.parse(raw);
  } catch {
    return { errors: ['file is not valid JSON'], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  if (!state.app_id) errors.push('missing required field: app_id');
  if (!state.schema)  errors.push('missing required field: schema');

  if (!Array.isArray(state.stages)) {
    errors.push('missing required field: stages (must be an array)');
    return { errors, warnings };
  }

  const stageNames = state.stages.map((s) => s.stage);

  for (const name of STAGE_ORDER) {
    if (!stageNames.includes(name)) errors.push(`missing stage: ${name}`);
  }

  for (const entry of state.stages) {
    if (!entry.stage) { errors.push('stage entry missing "stage" field'); continue; }

    if (!STAGE_ORDER.includes(entry.stage)) {
      errors.push(`unknown stage name: "${entry.stage}"`);
    }
    if (!entry.state) {
      errors.push(`stage "${entry.stage}" missing "state" field`);
    } else if (!VALID_STATES.has(entry.state)) {
      errors.push(`stage "${entry.stage}" has invalid state: "${entry.state}" (valid: ${[...VALID_STATES].join(', ')})`);
    }
    // Known gap: iteration/analysis often have no eval_result_ref — warn, not error.
    if (entry.state === 'verified' && !entry.eval_result_ref) {
      warnings.push(`stage "${entry.stage}" is verified but has no eval_result_ref (proof integrity check will skip it)`);
    }
  }

  return { errors, warnings };
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const [,, filePath] = process.argv;
  if (!filePath) {
    console.error('usage: validate.mjs <lifecycle-state.json>');
    process.exitCode = 1;
  } else {
    const { errors, warnings } = validate(filePath);
    for (const w of warnings) console.warn(`  WARN  ${w}`);
    if (errors.length === 0) {
      console.log(`OK — ${filePath}`);
    } else {
      console.error(`INVALID — ${filePath}`);
      for (const e of errors) console.error(`  ERROR ${e}`);
      process.exitCode = 1;
    }
  }
}

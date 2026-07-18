#!/usr/bin/env node
// Compares two KPI snapshots and prints the delta for every numeric field.
// Usage: node kpi-compare.mjs --baseline <path> --current <path>
// Exits 0 always (this is a reporting tool, not a gate).
import { readFileSync } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) a[argv[i].replace(/^--/, '')] = argv[i + 1];
  return a;
}

function flattenNumeric(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'number') out[key] = v;
    else if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flattenNumeric(v, key));
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.baseline || !args.current) {
  console.error('usage: kpi-compare.mjs --baseline <path> --current <path>');
  process.exitCode = 1;
} else {
  const b = flattenNumeric(JSON.parse(readFileSync(path.resolve(args.baseline), 'utf8')));
  const c = flattenNumeric(JSON.parse(readFileSync(path.resolve(args.current),  'utf8')));
  const keys = [...new Set([...Object.keys(b), ...Object.keys(c)])].sort();

  const w = Math.max(...keys.map((k) => k.length), 6);
  console.log('KPI COMPARISON');
  console.log(`baseline : ${args.baseline}`);
  console.log(`current  : ${args.current}`);
  console.log('');
  console.log(`${'metric'.padEnd(w)}  ${'baseline'.padStart(12)}  ${'current'.padStart(12)}  ${'delta'.padStart(12)}  ${'change'.padStart(8)}`);
  console.log('-'.repeat(w + 52));

  const fmt  = (v) => (v == null ? 'N/A' : v.toFixed(4)).padStart(12);
  const fmtD = (v) => (v == null ? 'N/A' : (v >= 0 ? '+' : '') + v.toFixed(4)).padStart(12);

  for (const key of keys) {
    const bv = b[key] ?? null;
    const cv = c[key] ?? null;
    const dv = bv != null && cv != null ? cv - bv : null;
    const pct = bv != null && cv != null && bv !== 0
      ? ((cv - bv) / Math.abs(bv) * 100).toFixed(1) + '%'
      : 'N/A';
    console.log(`${key.padEnd(w)}  ${fmt(bv)}  ${fmt(cv)}  ${fmtD(dv)}  ${pct.padStart(8)}`);
  }
}

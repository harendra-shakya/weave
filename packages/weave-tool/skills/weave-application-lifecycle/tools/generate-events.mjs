#!/usr/bin/env node
// Generates a deterministic synthetic event stream for lifecycle KPI measurement.
// Same seed → same output every time. Freeze the baseline, adapt, rerun with the
// same seed to prove the delta is real, not noise.
//
// Usage:
//   node generate-events.mjs --seed <int> --count <int> [--schema <path>] [--output <path>]
//
// --seed    Integer seed (required). Determines every event that is generated.
// --count   Number of user sessions to simulate (default: 100).
// --schema  Optional JSON file with custom event types and funnel probabilities.
//           See examples/event-schema.example.json for the format.
// --output  Where to write the events file (default: ./events.json).
//
// Default funnel: view → engage → convert → fulfill → refund
// Override it via --schema to match your domain (purchases, signups, API calls, etc.)
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) a[argv[i].replace(/^--/, '')] = argv[i + 1];
  return a;
}

// ponytail: mulberry32 — stdlib has no seeded PRNG; this is 4 lines
function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

const DEFAULT_FUNNEL = [
  { type: 'view',    prob: 1.00 },
  { type: 'engage',  prob: 0.60 },
  { type: 'convert', prob: 0.30 },
  { type: 'fulfill', prob: 0.90 },
  { type: 'refund',  prob: 0.05 },
];

const args  = parseArgs(process.argv.slice(2));
const seed  = parseInt(args.seed  ?? '0',   10);
const count = parseInt(args.count ?? '100', 10);

if (Number.isNaN(seed) || Number.isNaN(count) || count < 1) {
  console.error('--seed must be an integer; --count must be a positive integer');
  process.exitCode = 1;
} else {
  const funnel = args.schema
    ? JSON.parse(readFileSync(path.resolve(args.schema), 'utf8')).funnel
    : DEFAULT_FUNNEL;

  const rand   = mulberry32(seed);
  const events = [];
  const BASE_TS = 1_700_000_000_000;

  for (let uid = 0; uid < count; uid++) {
    let active = true;
    for (const step of funnel) {
      if (!active) break;
      if (rand() <= step.prob) {
        events.push({
          user_id: `u${String(uid).padStart(6, '0')}`,
          event:   step.type,
          ts:      new Date(BASE_TS + uid * 60_000 + events.length * 1000).toISOString(),
        });
      } else {
        active = false;
      }
    }
  }

  const out = {
    schema:       'weave-events/v0.1',
    seed,
    user_count:   count,
    event_count:  events.length,
    generated_at: new Date().toISOString(),
    events,
  };

  const outPath = path.resolve(args.output ?? 'events.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`generated ${events.length} events from ${count} users (seed ${seed}) → ${outPath}`);
}

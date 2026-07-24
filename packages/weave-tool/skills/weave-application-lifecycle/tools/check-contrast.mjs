#!/usr/bin/env node
// check-contrast.mjs — the contrast gate the QA stage currently does by eye.
//
// Reads a design-token CSS sheet and a small pairs manifest that declares which
// foreground/background combinations the design actually uses, then fails closed
// (exit 1) on any pair below its WCAG AA threshold. Pure Node — no shell, no
// Python, no browser/canvas — so it runs everywhere the validator does.
//
// Contrast is a property of a PAIR, not a single token, and only the design knows
// which pairs are real. So the checker takes an explicit manifest rather than
// guessing combinations by name (the prohibition-contract pattern: declare intent,
// don't infer it). See starter-kit/README.md §QA-readiness.
//
//   node tools/check-contrast.mjs --tokens <file.css> --pairs <pairs.json>
//   node tools/check-contrast.mjs --selftest
//
// pairs.json:
//   { "aa_normal": 4.5, "aa_large": 3.0,
//     "checks": [ { "fg": "--ks-muted", "bg": "--ks-cream",
//                   "label": "muted body on cream", "size": "normal" } ] }
// fg/bg are either a "--token" reference resolved from the CSS, or a literal
// colour ("#736a63", "115 106 99", "oklch(53% 0.02 60)"). size defaults to normal.

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// --- colour parsing: hex, space/comma RGB channels, oklch ---------------------

function parseColor(raw, tokens = {}) {
  let s = String(raw).trim();
  if (s.startsWith('var(')) s = s.slice(4, s.lastIndexOf(')')).trim();
  if (s.startsWith('--')) {
    const v = tokens[s];
    if (v === undefined) throw new Error(`unknown token ${s}`);
    return parseColor(v, tokens);
  }
  if (s.startsWith('#')) return parseHex(s);
  if (s.startsWith('oklch')) return oklchToRgb(s);
  if (s.startsWith('rgb')) s = s.slice(s.indexOf('(') + 1, s.lastIndexOf(')'));
  const n = s.split(/[\s,/]+/).filter(Boolean).map(Number).slice(0, 3);
  if (n.length === 3 && n.every((x) => Number.isFinite(x))) return n;
  throw new Error(`cannot parse colour: ${raw}`);
}

function parseHex(s) {
  let h = s.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// oklch(L C H) → sRGB 0-255. L may be a percentage. Standard Ottosson matrices.
function oklchToRgb(s) {
  const parts = s.slice(s.indexOf('(') + 1, s.lastIndexOf(')')).split(/[\s,/]+/).filter(Boolean);
  let L = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
  const C = parseFloat(parts[1]) || 0;
  const H = parseFloat(parts[2]) || 0;
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, ss = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * ss,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * ss,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * ss,
  ];
  return lin.map((x) => {
    const g = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, g)) * 255);
  });
}

// --- WCAG contrast ------------------------------------------------------------

function relLuminance([r, g, b]) {
  const c = [r, g, b].map((v) => {
    const cs = v / 255;
    return cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(fg, bg) {
  const [a, b] = [relLuminance(fg), relLuminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// --- token extraction ---------------------------------------------------------

function extractTokens(css) {
  const out = {};
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

// --- runner -------------------------------------------------------------------

function run(css, manifest) {
  const tokens = extractTokens(css);
  const aaNormal = manifest.aa_normal ?? 4.5;
  const aaLarge = manifest.aa_large ?? 3.0;
  const rows = [];
  for (const chk of manifest.checks) {
    const fg = parseColor(chk.fg, tokens);
    const bg = parseColor(chk.bg, tokens);
    const ratio = contrastRatio(fg, bg);
    const threshold = chk.size === 'large' ? aaLarge : aaNormal;
    rows.push({ label: chk.label ?? `${chk.fg} on ${chk.bg}`, ratio, threshold, pass: ratio >= threshold });
  }
  return rows;
}

// --- self-test (the one runnable check) --------------------------------------

function selftest() {
  assert.ok(Math.abs(contrastRatio(parseColor('#000'), parseColor('#fff')) - 21) < 0.01, 'black/white = 21');
  assert.ok(Math.abs(contrastRatio(parseColor('#fff'), parseColor('#fff')) - 1) < 0.001, 'white/white = 1');
  // RGB-channel form and hex form of the same colour agree.
  assert.deepEqual(parseColor('115 106 99'), [115, 106, 99]);
  assert.deepEqual(parseColor('#736a63'), [115, 106, 99]);
  // oklch endpoints round-trip to near black/white → contrast ≈ 21.
  const oklchBW = contrastRatio(parseColor('oklch(0% 0 0)'), parseColor('oklch(100% 0 0)'));
  assert.ok(Math.abs(oklchBW - 21) < 0.2, `oklch endpoints ≈ 21, got ${oklchBW.toFixed(2)}`);
  // A failing pair is detected: light grey on white is below AA.
  const rows = run('--fg: #999; --bg: #fff;', { checks: [{ fg: '--fg', bg: '--bg', label: 'grey on white' }] });
  assert.equal(rows[0].pass, false, 'grey-on-white must fail AA');
  console.log('check-contrast selftest: OK');
}

// --- cli ----------------------------------------------------------------------

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

function main() {
  if (process.argv.includes('--selftest')) return selftest();
  const tokensPath = arg('--tokens');
  const pairsPath = arg('--pairs');
  if (!tokensPath || !pairsPath) {
    console.error('usage: node check-contrast.mjs --tokens <file.css> --pairs <pairs.json>');
    console.error('       node check-contrast.mjs --selftest');
    process.exit(2);
  }
  const rows = run(readFileSync(tokensPath, 'utf8'), JSON.parse(readFileSync(pairsPath, 'utf8')));
  let failed = 0;
  for (const r of rows) {
    const tag = r.pass ? 'PASS' : 'FAIL';
    if (!r.pass) failed++;
    console.log(`  ${tag}  ${r.ratio.toFixed(2)}:1  (need ${r.threshold}:1)  ${r.label}`);
  }
  if (failed) {
    console.log(`\n${failed} pair(s) below WCAG AA. Contrast is a hard gate — fix the token, do not defer.`);
    process.exit(1);
  }
  console.log(`\nAll ${rows.length} pair(s) clear WCAG AA.`);
}

main();

export { parseColor, oklchToRgb, contrastRatio, relLuminance, extractTokens, run };

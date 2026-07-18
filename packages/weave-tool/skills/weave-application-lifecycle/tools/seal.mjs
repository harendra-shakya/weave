#!/usr/bin/env node
// Seals an artifact directory: lists all files, computes sha256 checksums,
// and writes a manifest to <dir>/seal-manifest.json (or --out path).
// Usage: node seal.mjs --dir <path> [--out <manifest-path>]
// Exits 0 on success, 1 on failure.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function walkDir(dir, base) {
  const entries = [];
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    const rel  = path.relative(base, full).replace(/\\/g, '/');
    if (statSync(full).isDirectory()) {
      entries.push(...walkDir(full, base));
    } else if (name !== 'seal-manifest.json') {
      entries.push({ path: rel, sha256: sha256(full) });
    }
  }
  return entries;
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) a[argv[i].replace(/^--/, '')] = argv[i + 1];
  return a;
}

const args = parseArgs(process.argv.slice(2));
if (!args.dir) {
  console.error('usage: seal.mjs --dir <path> [--out <manifest-path>]');
  process.exitCode = 1;
} else {
  const dir     = path.resolve(args.dir);
  const files   = walkDir(dir, dir);
  const manifest = {
    schema:      'weave-seal-manifest/v0.1',
    sealed_at:   new Date().toISOString(),
    file_count:  files.length,
    files,
  };
  const outPath = args.out ? path.resolve(args.out) : path.join(dir, 'seal-manifest.json');
  writeFileSync(outPath, JSON.stringify(manifest, null, 2));
  console.log(`sealed ${files.length} files → ${outPath}`);
  for (const f of files) console.log(`  ${f.sha256.slice(0, 8)}  ${f.path}`);
}

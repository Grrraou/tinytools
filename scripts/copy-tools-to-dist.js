#!/usr/bin/env node
/**
 * Copies tools/ and tools-manifest.json into frontend/dist for static-only deployment.
 * Run after building the frontend. Usage: node scripts/copy-tools-to-dist.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'frontend', 'dist');
const TOOLS_SRC = path.join(ROOT, 'tools');
const MANIFEST_SRC = path.join(ROOT, 'tools-manifest.json');
const TOOLS_DEST = path.join(DIST, 'tools');
const MANIFEST_DEST = path.join(DIST, 'tools-manifest.json');

if (!fs.existsSync(DIST)) {
  console.error('Run frontend build first: cd frontend && npm run build');
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (fs.existsSync(TOOLS_SRC)) {
  copyDir(TOOLS_SRC, TOOLS_DEST);
  console.log('Copied tools/ to frontend/dist/tools/');
}
if (fs.existsSync(MANIFEST_SRC)) {
  fs.copyFileSync(MANIFEST_SRC, MANIFEST_DEST);
  console.log('Copied tools-manifest.json to frontend/dist/');
}

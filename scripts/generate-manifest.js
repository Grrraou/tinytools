#!/usr/bin/env node
/**
 * Scans the tools/ directory and generates tools-manifest.json.
 * Run after adding a new tool folder. Usage: node scripts/generate-manifest.js
 */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', 'tools');
const MANIFEST_PATH = path.join(__dirname, '..', 'tools-manifest.json');

const CATEGORY_ORDER = ['Text', 'Encoding', 'Web', 'Hashing', 'Other'];

function getDirectories(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => !name.startsWith('.'));
}

function readMeta(toolDir) {
  const metaPath = path.join(toolDir, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return null;
  }
}

function buildManifest() {
  const toolDirs = getDirectories(TOOLS_DIR);
  const tools = [];

  for (const name of toolDirs) {
    const toolPath = path.join(TOOLS_DIR, name);
    const indexPath = path.join(toolPath, 'index.html');
    if (!fs.existsSync(indexPath)) continue;

    const meta = readMeta(toolPath);
    const slug = name;
    tools.push({
      id: slug,
      path: `tools/${slug}/`,
      name: meta?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: meta?.category || 'Other',
      description: meta?.description || '',
      keywords: meta?.keywords || [],
      order: meta?.order != null ? meta.order : 999,
      icon: meta?.icon ?? '',
    });
  }

  // Sort: by category order, then by meta order, then by name
  tools.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category);
    const bi = CATEGORY_ORDER.indexOf(b.category);
    const ci = (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    if (ci !== 0) return ci;
    const oi = (a.order ?? 999) - (b.order ?? 999);
    if (oi !== 0) return oi;
    return a.name.localeCompare(b.name);
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    categories: [...new Set(tools.map(t => t.category))].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
    ),
    tools,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Generated ${MANIFEST_PATH} with ${tools.length} tools.`);
}

buildManifest();

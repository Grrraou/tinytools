/**
 * Minimal secure backend for TinyTools.
 * Serves static manifest + tool files. No user input is executed; tools run in iframe sandbox.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, 'tools');
const MANIFEST_PATH = path.join(ROOT, 'tools-manifest.json');
const DIST_DIR = path.join(ROOT, 'frontend', 'dist');

const app = express();

// Strict path validation: only allow [a-z0-9-] for tool slugs
const SLUG_REGEX = /^[a-z0-9-]+$/;

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self'; img-src 'self' data:; connect-src 'self'"
  );
}

app.use((req, res, next) => {
  setSecurityHeaders(res);
  next();
});

// Manifest: serve pre-generated file only (no dynamic filesystem read of arbitrary paths)
app.get('/tools-manifest.json', (req, res) => {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return res.status(404).json({ error: 'Manifest not found. Run: node scripts/generate-manifest.js' });
  }
  res.type('application/json');
  res.sendFile(MANIFEST_PATH);
});

// Serve tool index.html (e.g. /tools/unicode-search/ or /tools/unicode-search/index.html)
function serveToolFile(req, res, slug, file) {
  if (!SLUG_REGEX.test(slug)) return res.status(400).send('Invalid tool id');
  const safeFile = !file || file === 'index.html' ? 'index.html' : file;
  if (safeFile !== 'index.html' || (file && (file.includes('..') || path.isAbsolute(file)))) {
    return res.status(400).send('Invalid path');
  }
  const toolPath = path.join(TOOLS_DIR, slug, safeFile);
  const resolved = path.resolve(toolPath);
  if (!resolved.startsWith(path.resolve(TOOLS_DIR))) return res.status(403).send('Forbidden');
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return res.status(404).send('Not found');
  res.sendFile(resolved);
}

app.get('/tools/:slug/index.html', (req, res) => serveToolFile(req, res, req.params.slug, 'index.html'));
app.get('/tools/:slug/', (req, res) => serveToolFile(req, res, req.params.slug, 'index.html'));
app.get('/tools/:slug', (req, res) => {
  if (!SLUG_REGEX.test(req.params.slug)) return res.status(400).send('Invalid tool id');
  res.redirect(302, `/tools/${req.params.slug}/`);
});

// Frontend: prefer built dist
app.use(express.static(DIST_DIR, { index: 'index.html' }));

app.get('*', (req, res) => {
  const index = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(index)) {
    return res.sendFile(index);
  }
  res.status(404).send('Frontend not built. Run: cd frontend && npm run build');
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`TinyTools server http://localhost:${PORT}`);
});

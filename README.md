# Helpers

A **front-first** dev tools collection (Unicode search, Base64, HTML encode/decode, and more) with a single UI. Add new tools by adding a folder under `tools/` — no app code changes required.

## Features

- **URL paths** — Each tool has a direct URL: `/t/<slug>` (e.g. `/t/unicode-search`, `/t/time-converter`). Query parameters are passed into the tool iframe so you can link to results or filters (e.g. `/t/time-converter?ts=1707350400`). Helps with indexing and shareable links.
- **Search & categories** — Find tools by name, description, or keywords; filter by category.
- **Tool discovery** — Each tool is a folder with `index.html` and optional `meta.json`. Run `npm run generate-manifest` and it appears in the UI.
- **Secure** — Tools run in sandboxed iframes; backend only serves static files and manifest; strict CSP and path validation.
- **Backend only when needed** — You can serve the built frontend + tools as static files (no Node). Use the small Node server for dev or when you prefer one process.

## Quick start

```bash
# From repo root
npm run generate-manifest   # scan tools/ and build tools-manifest.json
cd frontend && npm install && npm run dev
```

Then run the backend in another terminal so the app can load the manifest and tools:

```bash
cd backend && npm install && node server.js
```

Open **http://localhost:5173** (Vite proxies `/tools` and `/tools-manifest.json` to the backend).

**Single-command production-style run:**

```bash
npm run build    # generate manifest, build frontend, copy tools into dist
cd backend && node server.js
```

Then open **http://localhost:3000**.

### Docker

```bash
make docker-build   # build image
make docker-run     # run container on port 3000 → http://localhost:3000
make docker-stop   # stop container
make docker-logs   # tail logs
```

### Makefile

Run `make help` for all targets. Common: `make build`, `make run`, `make dev`, `make generate-manifest`, `make docker-build`, `make docker-run`, `make clean`.

## Adding a new tool

1. Create a folder under `tools/` with a **slug** name (lowercase, numbers, hyphens only), e.g. `tools/my-tool/`.
2. Add `index.html` (and optionally `meta.json`).
3. Run `npm run generate-manifest` from the repo root.

**Example `tools/url-encode/meta.json`:**

```json
{
  "name": "URL Encode / Decode",
  "description": "Encode or decode URL components",
  "category": "Web",
  "keywords": ["url", "encode", "percent"],
  "order": 2
}
```

**Categories** (order in sidebar): `Text`, `Encoding`, `Web`, `Hashing`, `Other`. Use `category` in `meta.json`; unknown categories go under "Other". Use `order` for ordering inside a category.

**Tool rules:**

- One main file: `index.html`. No path traversal; backend only serves `index.html` under each tool slug.
- Tools run in an iframe with `sandbox="allow-scripts allow-same-origin"`. Prefer client-side logic so you don’t need the backend.
- Keep tools self-contained (inline or same-origin scripts only) so they work with the default CSP.
- **URL parameters (norm for all tools):** (1) **Read on load** — Use `URLSearchParams(window.location.search)` to restore state (filters, input, mode) so direct links work. (2) **Sync URL on change** — When the user changes state (search, category, encode/decode, etc.), tell the shell to update the address bar so the link stays shareable: `if (window.parent !== window) window.parent.postMessage({ type: 'helpers-set-query', query: { param: value, ... } }, location.origin);` The shell will not reload the iframe. Param names are tool-specific; keep them short and document below.

**URL params by tool:**

| Tool | Params | Description |
|------|--------|--------------|
| unicode-search | `q`, `cat` | Search text; category name (e.g. `Arrows` or empty for All). |
| base64 | `t`, `m` | Input text (`t`); mode `encode` or `decode`. |
| html-encode-decode | `t`, `m` | Input text; mode `encode` or `decode`. |
| time-converter | `ts`, `tz` | Timestamp or date string; timezone filter substring. |

## Project layout

```
helpers/
  frontend/          # Vue 3 + Vite app (shell: search, categories, iframe)
  backend/           # Minimal Express server (static + /tools + manifest)
  tools/             # One folder per tool (index.html + optional meta.json)
  scripts/
    generate-manifest.js    # Scans tools/ → tools-manifest.json
    copy-tools-to-dist.js   # Copies tools + manifest into frontend/dist for static deploy
```

## Static-only deployment

After `npm run build`, `frontend/dist/` contains the app, `tools-manifest.json`, and `tools/**`. Serve `frontend/dist` with any static host (e.g. nginx, Vercel, Netlify). No Node backend required.

## Security

- **Backend:** Serves only pre-generated manifest and files under `tools/<slug>/index.html`. Slug validated with `[a-z0-9-]+`; path traversal rejected.
- **Frontend:** CSP set on all responses (script/style limited; no `eval`); tools run in iframes with sandbox.
- **No user input** is executed server-side; no dynamic require/import of user-controlled paths.

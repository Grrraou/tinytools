# TinyTools

A **single-page collection of small, focused tools** — unit converters (temperature, distance, speed, angles, CSS), text and encoding (Base64, URL, case, regex), time and date, finance, reference (Unicode, ports, HTTP status codes), and more. One UI, no sign-up, no tracking. Add new tools by adding a folder under `tools/`; no app code changes required.

## Features

- **URL paths** — Each tool has a direct URL: `/t/<slug>` (e.g. `/t/unicode-search`, `/t/time-converter`). Query parameters are passed into the tool iframe so you can link to results or filters (e.g. `/t/time-converter?ts=1707350400`). Shareable and indexable.
- **Search & categories** — Find tools by name, description, or keywords; filter by category.
- **Tool discovery** — Each tool is a folder with `index.html` and optional `meta.json`. Run `npm run generate-manifest` and it appears in the UI.
- **Secure** — Tools run in sandboxed iframes; backend only serves static files and manifest; strict CSP and path validation.
- **Backend optional** — You can serve the built frontend + tools as static files (no Node). Use the small Node server for dev or when you prefer one process.

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

**Port and container name** — On a server that already runs other Dockerized sites, set the host port and container name via a `.env` file so this app doesn’t clash:

```bash
cp env.example .env
# Edit .env: e.g. PORT=3001 and CONTAINER_NAME=tinytools-app
```

- **Make (Node image):** `make build` then `make dev` — app at `http://localhost:<PORT>` (default 3000).
- **Make (Apache2 image):** `make build-apache` then `make dev-apache` — same port mapping; container listens on 80.
- **Docker Compose:** `docker compose up -d --build` — reads `PORT` and `CONTAINER_NAME` from `.env`.
- **Apache via Compose:** `docker compose -f docker-compose.apache.yml up -d --build`.

Stop/remove: `make down` (or `docker compose down`).

### Makefile

Common: `make build`, `make dev`, `make down`, `make build-apache`, `make dev-apache`, `make generate-manifest`, `make delete`.

## Renaming the repository

If the repo is currently named something else (e.g. `helpers`) and you want to rename it to **TinyTools** (or `tinytools` / `tiny-tools`):

1. **On GitHub:** Repository → **Settings** → **General** → **Repository name** → change to `tinytools` (or your choice) → **Rename**.
2. **On GitLab:** Project → **Settings** → **General** → **Project name** and **Project URL** (path) → save.
3. **Update your local clone:**
   ```bash
   git remote set-url origin https://github.com/YOUR_USER/tinytools.git
   # or the new URL from your host
   ```
   If you prefer a fresh clone:
   ```bash
   git clone https://github.com/YOUR_USER/tinytools.git
   cd tinytools
   ```
4. The app name (TinyTools), package names (`tinytools`, `tinytools-frontend`, `tinytools-backend`), and Docker default container name (`tinytools-app`) are already set in this project. The **folder name** on disk can stay as-is (e.g. `helpers`); only the remote URL and optional clone path change when you rename the repo.

## Adding a new tool

1. Create a folder under `tools/` with a **slug** name (lowercase, numbers, hyphens only), e.g. `tools/my-tool/`.
2. Add `index.html` (and optionally `meta.json`).
3. Run `npm run generate-manifest` from the repo root.

**Example `tools/url-encode/meta.json`:**

```json
{
  "name": "URL Encode / Decode",
  "description": "Encode or decode URL components",
  "category": "Web & APIs",
  "keywords": ["url", "encode", "percent"],
  "order": 2
}
```

**Categories** (order in sidebar): `Text`, `Encoding`, `Cryptography`, `Web & APIs`, `CSS & Design`, `Units & Numbers`, `Finance`, `Time & Date`, `Reference`, `Other`. Use `category` or `categories` (array) in `meta.json`; unknown categories go under "Other". Use `order` for ordering inside a category.

**Tool rules:**

- One main file: `index.html`. No path traversal; backend only serves `index.html` under each tool slug.
- Tools run in an iframe with `sandbox="allow-scripts allow-same-origin"`. Prefer client-side logic so you don’t need the backend.
- Keep tools self-contained (inline or same-origin scripts only) so they work with the default CSP.
- **URL parameters (norm for all tools):** (1) **Read on load** — Use `URLSearchParams(window.location.search)` to restore state (filters, input, mode) so direct links work. (2) **Sync URL on change** — When the user changes state, tell the shell to update the address bar so the link stays shareable: `if (window.parent !== window) window.parent.postMessage({ type: 'helpers-set-query', query: { param: value, ... } }, location.origin);` The shell will not reload the iframe. Param names are tool-specific; keep them short and document below.

**URL params by tool:**

| Tool | Params | Description |
|------|--------|--------------|
| unicode-search | `q`, `cat` | Search text; category name (e.g. `Arrows` or empty for All). |
| base64 | `t`, `m` | Input text (`t`); mode `encode` or `decode`. |
| html-encode-decode | `t`, `m` | Input text; mode `encode` or `decode`. |
| time-converter | `ts`, `tz` | Timestamp or date string; timezone filter substring. |

## Project layout

```
<repo root>/
  frontend/          # Vue 3 + Vite app (shell: search, categories, iframe)
  backend/           # Minimal Express server (static + /tools + manifest)
  tools/             # One folder per tool (index.html + optional meta.json)
  scripts/
    generate-manifest.js    # Scans tools/ → tools-manifest.json
    copy-tools-to-dist.js   # Copies tools + manifest into frontend/dist for static deploy
```

## Static-only deployment

After `npm run build`, `frontend/dist/` contains the app, `tools-manifest.json`, and `tools/**`. Serve `frontend/dist` with any static host (e.g. nginx, Apache, Vercel, Netlify). No Node backend required. For Apache in Docker with a configurable port, use `Dockerfile.apache` and set `PORT` in `.env`.

## Security

- **Backend:** Serves only pre-generated manifest and files under `tools/<slug>/index.html`. Slug validated with `[a-z0-9-]+`; path traversal rejected.
- **Frontend:** CSP set on all responses (script/style limited; no `eval`); tools run in iframes with sandbox.
- **No user input** is executed server-side; no dynamic require/import of user-controlled paths.

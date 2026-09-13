# NMDP Tabling Pop-Up Campaign & Interactive Portal
### UC Berkeley MDes × NMDP Blood & Pediatric Cancer Awareness Drive (Sept 21, 2026)

An interactive campaign experience: a responsive invitation poster, dynamic QR
code tracking, a campus pledge registration portal, and a live analytics
dashboard backed by Postgres.

---

## ⚡ Setup (do this before the campaign goes live)

The app needs two environment variables. **Without `DATABASE_URL` no data is
saved at all** — visits and pledges vanish within minutes.

| Variable | Required | What it does |
|---|---|---|
| `DATABASE_URL` | **Yes** | Postgres connection string. Every visit, event and pledge is stored here. |
| `ADMIN_TOKEN` | **Yes** | Password for the dashboard. Protects the student roster and the clear/export actions. |
| `GEMINI_API_KEY` | No | Enables AI-written assignment reflections. Falls back to a template using the real numbers. |

### 1. Create a Postgres database

Any Postgres works — Vercel Postgres, Neon, or Supabase. The fastest path is
Vercel's own: **Vercel dashboard → Storage → Create Database → Postgres**, then
connect it to this project. `DATABASE_URL` is injected automatically.

If you use Supabase instead, copy the **Connection Pooling** URI (port `6543`),
not the direct connection string.

Tables are created automatically on first request — there is no migration step.

### 2. Set `ADMIN_TOKEN`

In **Vercel → Settings → Environment Variables**, add `ADMIN_TOKEN` with a long
random value. This is the password you'll type into the dashboard.

Skipping this doesn't expose anything — the protected endpoints return
"Admin access is not configured" until it's set — but the roster stays locked.

### 3. Redeploy

Environment variables only take effect on a new deployment.

### 4. Verify

Open `https://your-domain.vercel.app/api/health`. You want:

```json
{ "status": "ok", "storage": "postgres", "adminConfigured": true }
```

If `storage` says `"memory"`, `DATABASE_URL` isn't reaching the app and nothing
is being saved.

---

## 💻 Local Development

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and ADMIN_TOKEN
npm run dev                 # http://localhost:3000
```

The dev server runs the API and the Vite frontend on one port, so `/api/*` calls
behave exactly as they do in production.

```bash
npm run build               # build frontend + server bundle
npm run start               # preview the production build
npm run lint                # typecheck
```

---

## 🏗️ Architecture

```
src/                 React frontend (Vite + Tailwind)
server.ts            Express API — all routes live here
server/db.ts         Postgres storage layer (falls back to memory if unset)
api/index.ts         Vercel serverless entry point → re-exports the Express app
vercel.json          Routing: /api/* → the function, everything else → the SPA
```

### API

Public:

| Route | Purpose |
|---|---|
| `GET /api/health` | Storage + config status |
| `POST /api/track/visit` | Record a page/QR visit |
| `POST /api/track/event` | Record a micro-interaction |
| `POST /api/pledge` | Submit a student pledge |
| `GET /api/stats` | Aggregate counts (no personal data) |

Admin only — require the `X-Admin-Token` header:

| Route | Purpose |
|---|---|
| `GET /api/pledges` | Full pledge roster (contains real names) |
| `GET /api/export-data` | Raw JSON export |
| `POST /api/generate-summary` | Assignment reflection write-up |
| `POST /api/clear-all` | Wipe all data |
| `POST /api/reset-demo` | Alias of clear-all |

---

## 🛡️ Privacy

Contact details are masked before they are ever written to the database — the
raw email or phone number is never stored. The pledge roster is admin-only, so
student names are not visible to anyone holding the campaign link. The public
`/api/stats` endpoint returns counts only.

---

## 📋 Deployment notes

`vercel.json` rewrites `/api/<route>` to the serverless function while carrying
the route through a `__path` query parameter, which `server.ts` restores before
Express routing. This exists because a plain rewrite drops the sub-path, which
made every API call return an HTML 404 and surface in the UI as
"Connection error".

Storage is Postgres rather than a JSON file because Vercel functions are
stateless and short-lived: each request may land on a fresh instance with its
own empty `/tmp`, so file-based writes are lost and never shared between
instances.

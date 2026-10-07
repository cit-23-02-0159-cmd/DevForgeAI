# DevForge AI

An autonomous AI-powered software engineering platform, built in deliberate phases. **Phase 1** provides a runnable, responsive dashboard, a modular FastAPI service, a real PostgreSQL connectivity probe, and containerized infrastructure. It does not yet run AI agents or generate software.

## Architecture

```text
Browser → Next.js dashboard → /api/health proxy → FastAPI → PostgreSQL
```

- `frontend/`: Next.js App Router, React, TypeScript, responsive CSS. The dashboard polls health every 30 seconds and supports manual refresh, loading, and outage states.
- `backend/`: application factory, typed settings, API routes, database infrastructure, and tests.
- `compose.yaml`: three services, dependency health checks, persistent database storage, and local-only published ports.
- `docs/`: [architecture](docs/architecture.md) and [roadmap](docs/roadmap.md).

## Quick start with Docker

Install Docker with Compose v2, then run from the repository root:

```sh
cp .env.example .env
# Edit .env: replace POSTGRES_PASSWORD with your own local password.
docker compose up --build -d
docker compose ps
```

PowerShell: use `Copy-Item .env.example .env` instead of `cp`. Choose a password using URL-safe letters, digits, hyphens, or underscores, because Compose embeds it in the database URL. If changing ports, update `CORS_ORIGINS` to match the frontend origin.

Open:

- Dashboard: http://localhost:3000
- API readiness: http://localhost:8000/health
- API documentation: http://localhost:8000/docs

```sh
docker compose logs -f
docker compose down
```

The named PostgreSQL volume survives `down`. `docker compose down -v` permanently deletes that local database. PostgreSQL credentials are initialized only on the first start with an empty volume; editing `.env` does not change an existing database password.

## Local development

Requirements: Node.js 24 LTS, npm, Python 3.12+, and Docker Compose or a local PostgreSQL 17 instance. On Windows, use `npm.cmd` if PowerShell blocks the `npm.ps1` shim.

1. Configure and start the database:

   ```sh
   cp .env.example .env
   # Set your password.
   docker compose up -d postgres
   ```

2. Install frontend dependencies and configure its server-side API address:

   ```sh
   npm ci
   cp frontend/.env.example frontend/.env.local
   npm run dev
   ```

3. In another terminal, configure and run the backend:

   ```sh
   cd backend
   cp .env.example .env
   # Match DATABASE_URL to the database password, user, name, and published port.
   python -m venv .venv
   # macOS/Linux:
   .venv/bin/python -m pip install -r requirements-dev.lock
   .venv/bin/python -m pip install --no-deps -e .
   .venv/bin/python -m uvicorn app.main:app --reload
   ```

   Windows commands, from `backend/`:

   ```powershell
   Copy-Item .env.example .env
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements-dev.lock
   .\.venv\Scripts\python.exe -m pip install --no-deps -e .
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
   ```

No shell activation is required. Run the backend from `backend/` so its `.env` is loaded. If using a password containing URL-special characters with local PostgreSQL, percent-encode the password in `DATABASE_URL`.

The frontend can run independently. It reports an unavailable API until the backend starts. The API starts even when PostgreSQL is offline; `/health` then returns `503` with a degraded status. `/health/live` reports API process liveness independently of PostgreSQL.

## Development commands

```sh
# Repository root
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start --workspace frontend

# backend/ (Windows: use .venv\Scripts\python.exe)
.venv/bin/python -m pytest -q
.venv/bin/python -m ruff check .

# With frontend and backend running (also works against Compose)
.venv/bin/python scripts/smoke_check.py --api http://localhost:8000 --web http://localhost:3000
```

Dependency snapshots are in `package-lock.json`, `backend/requirements.lock` (runtime), and `backend/requirements-dev.lock` (runtime plus tooling). Python snapshots are generated with Python 3.12 on Windows; Docker installs the runtime snapshot on Linux using Uvicorn's portable event loop. To update Python dependencies intentionally, install `.[dev]` in a fresh environment, run the checks, and regenerate the snapshots with `.venv/bin/python scripts/lock_dependencies.py` (Windows: `.venv\Scripts\python.exe scripts/lock_dependencies.py`).

## Configuration and scope

Environment examples contain sample values only. `.env` files, dependency directories, and build artifacts are ignored. `BACKEND_URL` stays on the Next.js server; database credentials never enter client bundles. API errors do not expose database connection details. No external AI service or API key is needed.

This is a local portfolio foundation, not a public multi-user service. Authentication, authorization, rate limiting, TLS termination, migrations, and business entities belong to subsequent phases. There are deliberately no invented project metrics, fake agent activity, or placeholder API handlers. PostgreSQL is exercised through an actual `SELECT 1` probe; application tables will be introduced with migrations when domain features are added.

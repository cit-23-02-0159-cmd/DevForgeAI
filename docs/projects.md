# Phase 2A: Projects

Open `/projects` from the dashboard navigation. Create projects, select a card to
fetch its detail, edit its fields, and confirm permanent deletion. Requests use
same-origin Next.js proxies; `BACKEND_URL` remains server-only. Local development
uses `http://localhost:8010`; Compose keeps `http://backend:8000` internally.

Projects have UUID IDs, names (1–200 trimmed characters), descriptions (up to
10,000 characters), statuses (`draft`, `active`, `completed`, `archived`), and UTC
creation/update timestamps. Description defaults to an empty string; status
defaults to draft. PATCH changes only supplied fields and rejects explicit nulls.

| Endpoint | Result |
| --- | --- |
| POST /api/projects | 201, created project |
| GET /api/projects?offset=0&limit=100 | 200, newest-first array; limit 1–100 |
| GET /api/projects/{project_id} | 200, project |
| PATCH /api/projects/{project_id} | 200, updated project |
| DELETE /api/projects/{project_id} | 204, empty body |

Missing projects return 404, invalid input returns 422, and database failures
return a sanitized 503. The UI pages in groups of 24 and supports loading,
empty, error, saving, and deletion states.

The backend separates API routes, Pydantic schemas, services, repositories, and
SQLAlchemy models. Request-scoped sessions close and roll back unfinished work
when a request exits. The engine and existing health endpoints remain intact.

`backend/migrations/versions/0001_projects.py` creates the projects table and its
status constraint. Alembic reads the existing settings and `backend/.env`; no
credentials are embedded in migration files. Run migrations from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m alembic current
```

Compose applies migrations before starting Uvicorn. The API itself does not
implicitly create tables. For future model changes, generate and review a revision
with `python -m alembic revision --autogenerate -m "describe change"`.

Backend CRUD tests use an isolated SQLite database without modifying development
data. `python scripts/verify_projects.py` additionally checks real PostgreSQL
CRUD and health using the configured database, then removes its temporary project.

Phase 2A adds no AI execution, authentication, ownership, or audit system. The
workspace continues to be a local development application.

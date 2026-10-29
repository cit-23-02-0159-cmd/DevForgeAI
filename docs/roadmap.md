# DevForge AI roadmap

## Phase 1 — Foundation (implemented)

- Next.js and TypeScript dashboard with responsive layout.
- Live infrastructure status, manual refresh, and outage handling.
- Modular FastAPI application, readiness/liveness routes, and CORS.
- PostgreSQL connection pool and real database readiness probe.
- Docker Compose, persistent storage, environment examples, and documentation.
- Backend health tests, frontend lint/type checks, and production build scripts.

## Phase 2A — Projects (implemented)

Persistent project CRUD, UUIDs, status tracking, Alembic migrations, a Projects UI,
and backend regression tests. See [Projects Module](projects.md).

## Remaining Phase 2 — Project workspace

Add authentication, ownership, requirement capture, and audit records before autonomous execution.

## Phase 3 — Planning intelligence

Introduce requirement analysis, software architecture generation, and database design. Store versioned outputs with human review and explicit approval before downstream execution.

## Phase 4 — Coding and validation

Introduce AI coding agents, isolated job execution, automated testing, and security analysis. Add cancellation, resource limits, execution records, and artifact review. Keep generated code isolated from the control plane and credentials.

## Phase 5 — Delivery

Add Git integration, branch and pull-request workflows, CI/CD, and Docker deployment. Use scoped credentials and review gates for repository writes and deployment actions.

## Phase 6 — Operations and repair

Add monitoring, telemetry, automated bug analysis, and proposed repairs. Validate repairs against regression tests and preserve rollback and human review paths.

Each phase should ship a usable vertical slice with documented contracts and appropriate tests. This roadmap is a sequencing guide, not a promise that these capabilities already exist.

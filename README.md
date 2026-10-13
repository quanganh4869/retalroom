# RentFlow — Enterprise Rental Management Monorepo

RentFlow is an enterprise-grade property and rental management platform designed with a clean, decoupled monorepo architecture.

## 1. Architecture Overview

```text
                       RENTFLOW MONOREPO
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
        FRONTEND            BACKEND              AI
        React/TS            FastAPI           Python API
        (Vite)             (Async SQLAlchemy)  (Provider-based)
             │                 │                 │
             │                 ├────── HTTP ─────┘
             │                 │
             │                 ▼
             │             PostgreSQL
             │
             └──── HTTP REST API ────► Backend
```

### Decoupled Service Responsibilities

- **`frontend/` (React + TypeScript + Vite)**: User interface, client-side routing, form validation with Zod and React Hook Form, server state caching via TanStack Query. Does NOT query the database directly and contains zero secrets.
- **`backend/` (FastAPI + SQLAlchemy 2.x + Alembic)**: Source of truth for business logic, data persistence, multi-entity transactions, authentication foundation, and audit trails. Communicates with AI via structured HTTP requests.
- **`ai/` (Python API + Provider Pattern)**: Independent service for NLP and AI tasks (e.g. maintenance request categorization and priority scoring). Defaults to an offline, deterministic `MockAIProvider` so the system runs and tests completely without third-party API keys. Never touches the operational database.

---

## 2. Prerequisites

- **Node.js**: `v20+` (tested with Node 24 and npm 11)
- **Python**: `3.11+` (tested with Python 3.13)
- **uv**: Fast Python package installer and resolver (`uv >= 0.5`)
- **Docker & Docker Compose**: Optional for running the entire stack in containers

---

## 3. Quickstart with Docker Compose

1. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

2. Validate the compose configuration:
   ```bash
   docker compose --env-file .env.example config
   ```

3. Launch all services (PostgreSQL, Backend, AI, Frontend):
   ```bash
   docker compose --env-file .env.example up --build -d
   ```

4. Service URLs:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **AI Service Swagger Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

5. Stop services:
   ```bash
   docker compose down -v
   ```

---

## 4. Running Services Individually (Host Machine)

### 4.1. AI Service
```bash
cd ai
cp .env.example .env
uv sync
uv run uvicorn rentflow_ai.main:app --host 0.0.0.0 --port 8001 --reload
```
Health check: [http://localhost:8001/health/live](http://localhost:8001/health/live)

### 4.2. Backend Service
```bash
cd backend
cp .env.example .env
uv sync

# Run database migrations (if PostgreSQL is running)
uv run alembic upgrade head

uv run uvicorn rentflow_backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Health check: [http://localhost:8000/health/live](http://localhost:8000/health/live)
Interactive OpenAPI docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4.3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Testing, Linting & Type Checking

### Automated Testing Matrix
| Service | Lint / Format | Static Typecheck | Test Suite |
| :--- | :--- | :--- | :--- |
| **Frontend** | `npm run lint`<br/>`npm run format:check` | `npm run typecheck` | `npm run test` (Vitest)<br/>`npm run test:e2e` (Playwright) |
| **Backend** | `uv run ruff check .`<br/>`uv run ruff format --check .` | `uv run mypy src` | `uv run pytest` (with coverage) |
| **AI Service**| `uv run ruff check .`<br/>`uv run ruff format --check .` | `uv run mypy src` | `uv run pytest` (with coverage) |

To run all checks quickly from the monorepo root:
```bash
# Using Makefile
make lint
make test

# Or run commands directly inside each directory
```

---

## 6. Database Migrations (Backend)

We use **Alembic** with async SQLAlchemy:
```bash
cd backend

# Create a new migration revision
uv run alembic revision -m "add_table_name"

# Apply pending migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1
```

---

## 7. Working Sample Features (Vertical Slice)

1. **Frontend**:
   - `PropertyListPage`: Dynamic listing of properties with loading, empty, and error feedback states.
   - `PropertyForm`: Form validation with React Hook Form + Zod, displaying field-level errors and sending typed requests through the unified `apiClient`.
2. **Backend**:
   - `GET /health/live` & `GET /health/ready`.
   - `GET /api/v1/properties`: Paginated property listing.
   - `POST /api/v1/properties`: Property creation with uniqueness validation.
   - `GET /api/v1/properties/{id}`: Detailed entity retrieval.
   - `POST /api/v1/properties/{id}/maintenance/classify-ai`: Inter-service HTTP call delegating ticket triage to the AI service.
3. **AI Service**:
   - `GET /health/live` & `GET /health/ready`.
   - `POST /api/v1/maintenance/classify`: Structured triage returning `category`, `suggested_priority`, `confidence_score`, and `rationale`. Defaults to deterministic mock engine with zero external dependencies.

---

## 8. Troubleshooting

- **Database connection error**: Ensure PostgreSQL is running. For local host development, set `DATABASE_URL=postgresql+asyncpg://postgres:postgres_local_secret@localhost:5432/rentflow_db`.
- **CORS error in frontend**: Ensure `CORS_ORIGINS` in `backend/.env` contains your frontend dev server address (e.g. `http://localhost:3000`).
- **AI Service unreachable in backend**: Ensure AI service is running on port 8001 and `AI_SERVICE_URL=http://localhost:8001` in `backend/.env`.

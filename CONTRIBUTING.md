# Contributing to RentFlow

Thank you for contributing to the RentFlow monorepo! This document provides instructions for developers.

## Monorepo Architecture

RentFlow is composed of three decoupled core services:
1. `frontend/`: React + TypeScript (Vite, React Router, TanStack Query, React Hook Form, Zod).
2. `backend/`: Python + FastAPI (SQLAlchemy 2.x, Alembic, Pydantic, PostgreSQL).
3. `ai/`: Independent Python microservice providing triage, classification, and AI services.

## Branching & Git Conventions

- **Main branch**: `main`
- **Feature branches**: `feat/<feature-name>`
- **Bugfixes**: `fix/<issue-name>`
- **Chore / Refactor**: `chore/<task-name>`, `refactor/<name>`

### Conventional Commits

We adhere strictly to Conventional Commits:
- `feat:` A new user-facing feature.
- `fix:` A bug fix.
- `docs:` Documentation updates.
- `test:` Adding or improving tests.
- `refactor:` Code changes that neither fix bugs nor add features.
- `chore:` Tooling, dependency, or configuration updates.

Example:
```bash
git commit -m "feat(backend): implement property deletion endpoint"
```

## Local Development Checklist

Before opening a Pull Request, verify that all three services pass linting, type checks, and automated tests:

### Frontend
```bash
cd frontend
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
```

### Backend
```bash
cd backend
uv run ruff check .
uv run ruff format --check .
uv run mypy src
uv run pytest
```

### AI Service
```bash
cd ai
uv run ruff check .
uv run ruff format --check .
uv run mypy src
uv run pytest
```

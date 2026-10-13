# Multi-stage Dockerfile for RentFlow Backend
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Install dependencies first for efficient layer caching
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy project source and install project
COPY README.md ./
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./
RUN uv sync --frozen --no-dev

# Final runtime stage
FROM python:3.13-slim-bookworm AS runner

WORKDIR /app

# Run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app /app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "rentflow_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

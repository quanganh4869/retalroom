.PHONY: help install dev test lint format clean docker-up docker-down

help:
	@echo "RentFlow Monorepo - Enterprise Automation Commands"
	@echo "  make install      - Install dependencies across frontend, backend, and ai"
	@echo "  make dev          - Run all services locally via docker compose"
	@echo "  make test         - Run test suites across all 3 services"
	@echo "  make lint         - Run linters across all 3 services"
	@echo "  make format       - Auto-format code across all 3 services"
	@echo "  make docker-up    - Build and launch Docker Compose stack"
	@echo "  make docker-down  - Stop Docker Compose stack"

install:
	cd frontend && npm ci
	cd backend && uv sync
	cd ai && uv sync

test:
	cd frontend && npm run test
	cd backend && uv run pytest
	cd ai && uv run pytest

lint:
	cd frontend && npm run lint
	cd backend && uv run ruff check . && uv run mypy src
	cd ai && uv run ruff check . && uv run mypy src

format:
	cd frontend && npm run format
	cd backend && uv run ruff format .
	cd ai && uv run ruff format .

docker-up:
	docker compose --env-file .env.example up --build -d

docker-down:
	docker compose down -v

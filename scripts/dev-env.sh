#!/usr/bin/env bash
# ==============================================================================
# RentFlow Development Environment Manager (Bash)
# ==============================================================================
set -euo pipefail

ACTION="${1:-up}"

case "$ACTION" in
    up)
        echo ">>> Starting PostgreSQL development database via Docker Compose..."
        docker compose up -d postgres
        echo ">>> Database ready on port 5432."
        ;;
    down)
        echo ">>> Stopping PostgreSQL..."
        docker compose stop postgres
        ;;
    status)
        docker compose ps
        ;;
    restart)
        docker compose restart postgres
        ;;
    *)
        echo "Usage: $0 {up|down|status|restart}"
        exit 1
        ;;
esac

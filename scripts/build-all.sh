#!/usr/bin/env bash
# ==============================================================================
# RentFlow Build All Projects (Bash)
# ==============================================================================
set -euo pipefail

echo ">>> Building Backend (Java Spring Boot JAR)..."
(cd backend && ./mvnw clean package -DskipTests)

echo ">>> Building Frontend (Vite Production Bundle)..."
(cd frontend && npm run build)

echo ">>> Both Backend and Frontend built successfully!"

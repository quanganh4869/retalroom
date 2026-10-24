#!/usr/bin/env bash
# ==============================================================================
# RentFlow Run All Tests (Bash)
# ==============================================================================
set -euo pipefail

echo ">>> 1. Running Backend Tests..."
(cd backend && ./mvnw clean test)

echo ">>> 2. Running Frontend Tests & Typecheck..."
(cd frontend && npm run typecheck && npm run test)

echo ">>> All tests completed successfully!"

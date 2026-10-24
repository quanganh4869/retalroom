# ==============================================================================
# RentFlow Run All Tests (PowerShell)
# Runs frontend tests (vitest, typecheck) and backend tests (Spring Boot / Maven)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 1. Running Backend Tests (Spring Boot)   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Push-Location backend
try {
    .\mvnw.cmd clean test
} finally {
    Pop-Location
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " 2. Running Frontend Tests & Typecheck    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Push-Location frontend
try {
    npm run typecheck
    npm run test
} finally {
    Pop-Location
}

Write-Host "`n>>> All tests completed successfully!" -ForegroundColor Green

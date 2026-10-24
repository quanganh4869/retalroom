# ==============================================================================
# RentFlow Build All Projects (PowerShell)
# Builds backend jar and frontend static bundle
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ">>> Building Backend (Java Spring Boot JAR)..." -ForegroundColor Cyan
Push-Location backend
try {
    .\mvnw.cmd clean package -DskipTests
} finally {
    Pop-Location
}

Write-Host "`n>>> Building Frontend (Vite Production Bundle)..." -ForegroundColor Cyan
Push-Location frontend
try {
    npm run build
} finally {
    Pop-Location
}

Write-Host "`n>>> Both Backend and Frontend built successfully!" -ForegroundColor Green

# ==============================================================================
# RentFlow Development Environment Manager (PowerShell)
# Usage:
#   .\scripts\dev-env.ps1 up      # Start PostgreSQL container
#   .\scripts\dev-env.ps1 down    # Stop PostgreSQL container
#   .\scripts\dev-env.ps1 status  # Check container status & health
# ==============================================================================

param (
    [Parameter(Position=0)]
    [ValidateSet("up", "down", "status", "restart")]
    [string]$Action = "up"
)

$ErrorActionPreference = "Stop"

switch ($Action) {
    "up" {
        Write-Host ">>> Starting PostgreSQL development database via Docker Compose..." -ForegroundColor Cyan
        docker compose up -d postgres
        Write-Host ">>> Waiting for PostgreSQL to become healthy..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        docker compose ps postgres
        Write-Host ">>> Database is ready on port 5432 (rentflow_db)." -ForegroundColor Green
    }
    "down" {
        Write-Host ">>> Stopping development containers..." -ForegroundColor Cyan
        docker compose stop postgres
        Write-Host ">>> PostgreSQL stopped successfully." -ForegroundColor Green
    }
    "status" {
        docker compose ps
    }
    "restart" {
        docker compose restart postgres
    }
}

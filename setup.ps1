# ============================================================
# GitOps Dashboard - PowerShell Setup & Run Script
# Run from the gitops-dashboard/ root directory:
#   .\setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}
function Write-Ok($msg) {
    Write-Host "  OK: $msg" -ForegroundColor Green
}
function Write-Warn($msg) {
    Write-Host "  WARN: $msg" -ForegroundColor Yellow
}

# ── 0. Check Node.js ────────────────────────────────────────
Write-Step "Checking Node.js..."
try {
    $nodeVersion = node --version
    Write-Ok "Node $nodeVersion found"
} catch {
    Write-Host "ERROR: Node.js not found. Install from https://nodejs.org (v18+)" -ForegroundColor Red
    exit 1
}

# ── 1. Install client dependencies ──────────────────────────
Write-Step "Installing client dependencies..."
Push-Location client
npm install --legacy-peer-deps
Pop-Location
Write-Ok "Client deps installed"

# ── 2. Install server dependencies ──────────────────────────
Write-Step "Installing server dependencies..."
Push-Location server
npm install
Pop-Location
Write-Ok "Server deps installed"

# ── 3. Check .env ───────────────────────────────────────────
Write-Step "Checking environment config..."
if (-not (Test-Path "server\.env")) {
    Copy-Item ".env" "server\.env"
    Write-Ok "Copied .env to server\.env"
} else {
    Write-Ok "server\.env already exists"
}

$envContent = Get-Content "server\.env" -Raw
if ($envContent -match "DATABASE_URL=\s*$") {
    Write-Warn "DATABASE_URL is empty — running in demo mode (no database needed)"
    Write-Warn "To use a real database, set DATABASE_URL=mysql://user:pass@host:3306/gitops in server\.env"
} else {
    Write-Ok "DATABASE_URL is configured"
}

# ── 4. Done — show run instructions ─────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host " Setup complete! To start the app:" -ForegroundColor Magenta
Write-Host ""
Write-Host "   Option A — Start everything at once:" -ForegroundColor White
Write-Host "   Open TWO PowerShell terminals:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 (server):" -ForegroundColor Yellow
Write-Host "     cd server" -ForegroundColor Gray
Write-Host "     npx tsx watch src/index.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 (client):" -ForegroundColor Yellow
Write-Host "     cd client" -ForegroundColor Gray
Write-Host "     npx vite" -ForegroundColor Gray
Write-Host ""
Write-Host "   Then open: http://localhost:5173" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Start the API server (run this in Terminal 1)
# From the gitops-dashboard/ root:  .\start-server.ps1

Set-Location server
Write-Host "Starting GitOps API server on http://localhost:3001 ..." -ForegroundColor Cyan
npx tsx watch src/index.ts

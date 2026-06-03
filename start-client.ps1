# Start the Vite dev server (run this in Terminal 2)
# From the gitops-dashboard/ root:  .\start-client.ps1

Set-Location client
Write-Host "Starting GitOps frontend on http://localhost:5173 ..." -ForegroundColor Cyan
npx vite

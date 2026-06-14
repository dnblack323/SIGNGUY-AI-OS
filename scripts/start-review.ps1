$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$runtime = "C:\Users\thesi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$python = if (Test-Path $runtime) { $runtime } else { "python" }
$npm = "C:\Program Files\nodejs\npm.cmd"
$review = Join-Path $root ".review"

New-Item -ItemType Directory -Force -Path $review | Out-Null

function Stop-RecordedProcess([string]$name) {
    $pidFile = Join-Path $review "$name.pid"
    if (Test-Path $pidFile) {
        $processId = Get-Content $pidFile -ErrorAction SilentlyContinue
        if ($processId) { Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue }
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
}

Stop-RecordedProcess "frontend"
Stop-RecordedProcess "backend"

$backend = Start-Process -FilePath $python -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory (Join-Path $root "backend") -RedirectStandardOutput (Join-Path $review "backend.log") -RedirectStandardError (Join-Path $review "backend-error.log") -WindowStyle Hidden -PassThru
$frontend = Start-Process -FilePath $npm -ArgumentList "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173" -WorkingDirectory (Join-Path $root "frontend") -RedirectStandardOutput (Join-Path $review "frontend.log") -RedirectStandardError (Join-Path $review "frontend-error.log") -WindowStyle Hidden -PassThru

$backend.Id | Set-Content (Join-Path $review "backend.pid")
$frontend.Id | Set-Content (Join-Path $review "frontend.pid")

$deadline = (Get-Date).AddSeconds(20)
do {
    Start-Sleep -Milliseconds 500
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 2
        $frontendReady = (Invoke-WebRequest -Uri "http://127.0.0.1:5173/" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200
    } catch {
        $health = $null
        $frontendReady = $false
    }
} until (($health -and $frontendReady) -or (Get-Date) -gt $deadline)

if (-not ($health -and $frontendReady)) {
    Write-Host "Review environment did not start. Check .review logs."
    exit 1
}

Write-Host "SignGuyAI review environment is ready."
Write-Host "Full app: http://127.0.0.1:5173/"
Write-Host "Webstores standalone: http://127.0.0.1:5173/?mode=webstores"
Write-Host "Backend API docs: http://127.0.0.1:8000/docs"

$root = Split-Path -Parent $PSScriptRoot
$review = Join-Path $root ".review"

foreach ($name in @("frontend", "backend")) {
    $pidFile = Join-Path $review "$name.pid"
    if (Test-Path $pidFile) {
        $processId = Get-Content $pidFile -ErrorAction SilentlyContinue
        if ($processId) { Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue }
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "SignGuyAI review environment stopped."

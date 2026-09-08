# SkillProof - Start Local PostgreSQL Server
$pgBin = "C:\Users\kusha\pgsql\bin"
$pgData = "C:\Users\kusha\pgsql\data"
$pgLog = "C:\Users\kusha\pgsql\logfile.log"

$running = Get-Process -Name postgres -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "PostgreSQL server is already running." -ForegroundColor Green
} else {
    Write-Host "Starting PostgreSQL server..." -ForegroundColor Cyan
    & "$pgBin\pg_ctl.exe" -D "$pgData" -l "$pgLog" start
    Start-Sleep -Seconds 1
}

& "$pgBin\pg_isready.exe" -h 127.0.0.1 -p 5432 -U postgres

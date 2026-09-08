# SkillProof - Stop Local PostgreSQL Server
$pgBin = "C:\Users\kusha\pgsql\bin"
$pgData = "C:\Users\kusha\pgsql\data"

Write-Host "Stopping PostgreSQL server..." -ForegroundColor Cyan
& "$pgBin\pg_ctl.exe" -D "$pgData" stop

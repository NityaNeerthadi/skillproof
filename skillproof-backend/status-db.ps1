# SkillProof - Check Local PostgreSQL Server Status
$pgBin = "C:\Users\kusha\pgsql\bin"
$pgData = "C:\Users\kusha\pgsql\data"

& "$pgBin\pg_ctl.exe" -D "$pgData" status

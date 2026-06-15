param()

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "..\supabase-schema.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Error "Missing schema file: $sqlFile"
    exit 1
}

if (-not $env:SUPABASE_DB_URL) {
    Write-Host "Please set SUPABASE_DB_URL to your Supabase Postgres connection string."
    exit 1
}

Write-Host "Applying Supabase schema from $sqlFile..."
& psql $env:SUPABASE_DB_URL -f $sqlFile
Write-Host "Supabase schema applied successfully."

if ($env:SUPABASE_URL -and $env:SUPABASE_SERVICE_KEY) {
    Write-Host "`nReady to configure Netlify environment variables:"
    Write-Host "  netlify env:set SUPABASE_URL $env:SUPABASE_URL"
    Write-Host "  netlify env:set SUPABASE_SERVICE_KEY $env:SUPABASE_SERVICE_KEY"
} else {
    Write-Host "`nSet SUPABASE_URL and SUPABASE_SERVICE_KEY in Netlify site settings before deployment."
}

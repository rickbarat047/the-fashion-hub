<#
.SYNOPSIS
  Stages, commits and pushes all storefront changes to GitHub (origin/main).
  Used after every code update so the contribution graph stays active.
.EXAMPLE
  powershell -File scripts\git-sync.ps1 -Message "feat: add product 40"
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$Message
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$gitExe = 'C:\Users\rickb\AppData\Local\FashionHubTools\mingit\cmd\git.exe'
if (-not (Test-Path $gitExe)) {
  $gitExe = 'C:\Users\rickb\AppData\Local\Temp\opencode\mingit\cmd\git.exe'
}
if (-not (Test-Path $gitExe)) {
  throw 'Portable Git was not found. Cannot sync to GitHub.'
}

Push-Location $repoRoot
try {
  & $gitExe add --all
  if ($LASTEXITCODE -ne 0) { throw 'git add failed' }

  $pending = & $gitExe status --porcelain
  if (-not $pending) {
    Write-Host 'No changes to commit.'
    return
  }

  & $gitExe commit -m $Message
  if ($LASTEXITCODE -ne 0) { throw 'git commit failed' }

  & $gitExe push origin main
  if ($LASTEXITCODE -ne 0) { throw 'git push failed' }

  Write-Host "Pushed to origin/main: $Message"
}
finally {
  Pop-Location
}

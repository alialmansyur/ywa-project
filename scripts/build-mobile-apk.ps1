param(
  [string]$Profile = "preview",
  [string]$Platform = "android",
  [switch]$SkipInstall,
  [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$MobileDir = Join-Path $ProjectRoot "apps/mobile"

Write-Host "[1/5] Go to mobile app: $MobileDir" -ForegroundColor Cyan
Set-Location $MobileDir

if (-not $SkipInstall) {
  Write-Host "[2/5] Install npm dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host "[3/5] Ensure EAS CLI installed..." -ForegroundColor Cyan
$easCmd = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easCmd) {
  npm i -g eas-cli
}

function Invoke-Eas {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
  )

  $cmd = Get-Command eas -ErrorAction SilentlyContinue
  if ($cmd) {
    & eas @Args
  } else {
    & npx eas @Args
  }
  return $LASTEXITCODE
}

if (-not $NonInteractive) {
  Write-Host "[4/5] Login/check EAS session..." -ForegroundColor Cyan
  Invoke-Eas whoami | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Invoke-Eas login
  }
}

Write-Host "[5/5] Build APK via EAS (platform=$Platform, profile=$Profile)..." -ForegroundColor Cyan
if ($NonInteractive) {
  Invoke-Eas build -p $Platform --profile $Profile --non-interactive
} else {
  Invoke-Eas build -p $Platform --profile $Profile
}

Write-Host "Done. Check build URL from EAS output." -ForegroundColor Green

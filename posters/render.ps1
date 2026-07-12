# Render a poster HTML to PNG via headless Edge.
# Usage: .\posters\render.ps1 jumma-mubarak            (1080x1350 @2x)
#        .\posters\render.ps1 name -W 1080 -H 1920     (story size)
param(
  [Parameter(Mandatory)][string]$Name,
  [int]$W = 1080,
  [int]$H = 1350,
  [int]$Scale = 2
)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
$root = Split-Path $PSCommandPath
$html = Join-Path $root "$Name.html"
if (-not (Test-Path $html)) { throw "No such poster: $html" }
$out = Join-Path $root "out\$Name.png"
New-Item -ItemType Directory -Force (Join-Path $root 'out') | Out-Null
$profile = Join-Path $env:TEMP "edge-poster-render"
& $edge --headless=new --no-first-run --disable-gpu --disable-extensions `
  --user-data-dir="$profile" `
  --screenshot="$out" --window-size="$W,$H" --force-device-scale-factor=$Scale `
  --hide-scrollbars --virtual-time-budget=15000 `
  "file:///$($html -replace '\\','/')" 2>$null | Out-Null
Write-Host "rendered: $out ($($W*$Scale)x$($H*$Scale))"

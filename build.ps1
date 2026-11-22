# Empacota o app em dist\IgorTV.wgt (assinado com o perfil "igortv").
$ErrorActionPreference = 'Stop'
$T = 'C:\tizen-studio\tools\ide\bin\tizen.bat'
$root = $PSScriptRoot
$build = Join-Path $root 'build'
$dist = Join-Path $root 'dist'
if (Test-Path $build) { Remove-Item -Recurse -Force $build }
New-Item -ItemType Directory -Force $build, $dist | Out-Null
Copy-Item -Recurse (Join-Path $root 'app\*') $build
& $T package -t wgt -s igortv -o $dist -- $build
$w = Get-ChildItem $dist -Filter *.wgt | Sort-Object LastWriteTime | Select-Object -Last 1
Move-Item -Force $w.FullName (Join-Path $dist 'IgorTV.wgt')
Remove-Item -Recurse -Force $build
Write-Host "Pacote pronto: $(Join-Path $dist 'IgorTV.wgt')"

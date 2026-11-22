# Empacota o app em dist\IgorTV.wgt (assinado com o perfil "igortv").
$ErrorActionPreference = 'Stop'
$T = 'C:\tizen-studio\tools\ide\bin\tizen.bat'
$root = $PSScriptRoot
$build = Join-Path $root 'build'
$dist = Join-Path $root 'dist'
$out = Join-Path $dist 'IgorTV.wgt'
if (Test-Path $build) { Remove-Item -Recurse -Force $build }
New-Item -ItemType Directory -Force $build, $dist | Out-Null
# apaga pacotes antigos: o tizen gera "Igor TV.wgt" e um IgorTV.wgt velho não pode sobrar
Get-ChildItem $dist -Filter *.wgt | Remove-Item -Force
Copy-Item -Recurse (Join-Path $root 'app\*') $build
& $T package -t wgt -s igortv -o $dist -- $build | Out-Null
$w = Get-ChildItem $dist -Filter *.wgt | Select-Object -First 1
if (-not $w) { throw 'O tizen não gerou o pacote .wgt' }
Rename-Item $w.FullName 'IgorTV.wgt'
Remove-Item -Recurse -Force $build
# confere se o pacote tem o index.html atual
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($out)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'index.html' }
$sr = New-Object IO.StreamReader($entry.Open()); $inPkg = $sr.ReadToEnd(); $sr.Close(); $zip.Dispose()
$local = [IO.File]::ReadAllText((Join-Path $root 'app\index.html'))
if ($inPkg -ne $local) { throw 'O pacote não bate com app\index.html' }
Write-Host "Pacote pronto e conferido: $out ($((Get-Item $out).LastWriteTime))"

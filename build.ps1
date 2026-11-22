# Empacota o app em dist\IPTV.wgt (assinado com o perfil "userptv").
$ErrorActionPreference = 'Stop'
$T = 'C:\tizen-studio\tools\ide\bin\tizen.bat'
$root = $PSScriptRoot
$build = Join-Path $root 'build'
$dist = Join-Path $root 'dist'
$out = Join-Path $dist 'IPTV.wgt'
if (Test-Path $build) { Remove-Item -Recurse -Force $build }
New-Item -ItemType Directory -Force $build, $dist | Out-Null
# apaga pacotes antigos (inclusive o IgorTV.wgt de antes da troca de nome): nenhum pacote velho pode sobrar
Get-ChildItem $dist -Filter *.wgt | Remove-Item -Force
Copy-Item -Recurse (Join-Path $root 'app\*') $build
& $T package -t wgt -s userptv -o $dist -- $build | Out-Null
$w = Get-ChildItem $dist -Filter *.wgt | Select-Object -First 1
if (-not $w) { throw 'O tizen não gerou o pacote .wgt' }
if ($w.Name -ne 'IPTV.wgt') { Rename-Item $w.FullName 'IPTV.wgt' }
Remove-Item -Recurse -Force $build
# confere se o pacote tem o index.html atual
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($out)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'index.html' }
$sr = New-Object IO.StreamReader($entry.Open()); $inPkg = $sr.ReadToEnd(); $sr.Close(); $zip.Dispose()
$local = [IO.File]::ReadAllText((Join-Path $root 'app\index.html'))
if ($inPkg -ne $local) { throw 'O pacote não bate com app\index.html' }
Write-Host "Pacote pronto e conferido: $out ($((Get-Item $out).LastWriteTime))"

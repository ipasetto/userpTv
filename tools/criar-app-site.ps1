# Gera um app separado da TV para um site (abre o site em tela cheia, com nome e ícone próprios)
# e instala na TV se ela estiver com o IP do PC no modo desenvolvedor.
# Uso: powershell -File tools\criar-app-site.ps1 -Nome "Meu site" -Url "https://exemplo.com" [-Cor "#1b4f8f"] [-NaoInstalar]
param(
  [Parameter(Mandatory = $true)][string]$Nome,
  [Parameter(Mandatory = $true)][string]$Url,
  [string]$Cor = "",
  [switch]$NaoInstalar
)
$ErrorActionPreference = 'Stop'
if ($Url -notmatch '^https?://') { throw "O endereço precisa começar com https:// (ou http://)" }
$root = Split-Path $PSScriptRoot -Parent
$T = 'C:\tizen-studio\tools\ide\bin\tizen.bat'
$sdb = 'C:\tizen-studio\tools\sdb.exe'
$tv = '192.168.1.171'

# ID estável por endereço: "St" + 8 caracteres do hash = 10 caracteres (exigência do Tizen)
$sha = [BitConverter]::ToString((New-Object Security.Cryptography.SHA1Managed).ComputeHash([Text.Encoding]::UTF8.GetBytes($Url))).Replace('-', '')
$pkg = 'St' + $sha.Substring(0, 8)
$appId = "$pkg.Site"
$slug = ($Nome -replace '[^A-Za-z0-9]+', '-').Trim('-'); if (-not $slug) { $slug = $pkg }
$paleta = '#1b4f8f', '#1a5a6a', '#1a7a5a', '#8a3a14', '#2a3a8a', '#8a1a3a', '#3a6a1a', '#5a4a14'
if (-not $Cor) { $Cor = $paleta[[Convert]::ToInt32($sha.Substring(0, 2), 16) % $paleta.Count] }

$build = Join-Path $env:TEMP "app-site-$pkg"
if (Test-Path $build) { Remove-Item -Recurse -Force $build }
New-Item -ItemType Directory -Force $build | Out-Null
$enc = New-Object Text.UTF8Encoding $false
function Esc([string]$s) { return [Security.SecurityElement]::Escape($s) }

# config.xml
[IO.File]::WriteAllText("$build\config.xml", @"
<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns="http://www.w3.org/ns/widgets" xmlns:tizen="http://tizen.org/ns/widgets" id="http://userptv.local/site/$pkg" version="1.0.0" viewmodes="maximized">
    <tizen:application id="$appId" package="$pkg" required_version="2.3"/>
    <content src="index.html"/>
    <icon src="icon.png"/>
    <name>$(Esc $Nome)</name>
    <access origin="*" subdomains="true"/>
    <tizen:privilege name="http://tizen.org/privilege/internet"/>
    <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
    <tizen:profile name="tv-samsung"/>
    <tizen:setting screen-orientation="landscape" context-menu="disable" background-support="disable" encryption="disable" install-location="auto" hwkey-event="enable"/>
</widget>
"@, $enc)

# index.html: tela de abertura curta e depois o site ocupa o app inteiro
$urlJs = $Url.Replace('\', '\\').Replace('"', '\"')
[IO.File]::WriteAllText("$build\index.html", @"
<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=1920">
<title>$(Esc $Nome)</title>
<style>html,body{margin:0;height:100%;background:#101823;color:#f3efe6;font-family:"Segoe UI",sans-serif}
.c{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}
.n{font-size:64px;font-weight:600;margin-bottom:16px}.m{font-size:28px;color:#a9b3c2}</style></head>
<body><div class="c"><div class="n">$(Esc $Nome)</div><div class="m">Abrindo…</div></div>
<script>setTimeout(function(){ location.replace("$urlJs"); }, 300);</script>
</body></html>
"@, $enc)

# ícone: inicial do nome sobre a cor escolhida
Add-Type -AssemblyName System.Drawing
$bmp = New-Object Drawing.Bitmap 512, 512; $g = [Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'; $g.Clear([Drawing.Color]::Transparent)
$p = New-Object Drawing.Drawing2D.GraphicsPath; $r = 110; $d = $r * 2
$p.AddArc(0, 0, $d, $d, 180, 90); $p.AddArc(512 - $d, 0, $d, $d, 270, 90); $p.AddArc(512 - $d, 512 - $d, $d, $d, 0, 90); $p.AddArc(0, 512 - $d, $d, $d, 90, 90); $p.CloseFigure()
$g.FillPath((New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($Cor))), $p)
$f = New-Object Drawing.Font 'Segoe UI', 250, ([Drawing.FontStyle]::Bold), ([Drawing.GraphicsUnit]::Pixel)
$sf = New-Object Drawing.StringFormat; $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
$letra = $Nome.Trim().Substring(0, 1).ToUpper()
$g.DrawString($letra, $f, (New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 243, 239, 230))), (New-Object Drawing.RectangleF 0, 10, 512, 512), $sf)
$bmp.Save("$build\icon.png", [Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()

# empacota com o mesmo certificado do IPTV
$out = Join-Path $root 'dist\sites'
New-Item -ItemType Directory -Force $out | Out-Null
$tmpOut = Join-Path $env:TEMP "app-site-out-$pkg"; if (Test-Path $tmpOut) { Remove-Item -Recurse -Force $tmpOut }; New-Item -ItemType Directory $tmpOut | Out-Null
& $T package -t wgt -s userptv -o $tmpOut -- $build | Out-Null
$w = Get-ChildItem $tmpOut -Filter *.wgt | Select-Object -First 1
if (-not $w) { throw 'O tizen não gerou o pacote' }
$wgt = Join-Path $out "$slug.wgt"
Copy-Item $w.FullName $wgt -Force
Remove-Item -Recurse -Force $build, $tmpOut
Write-Host "Pacote: $wgt"
Write-Host "ID do app: $appId"

if (-not $NaoInstalar) {
  $con = & $sdb connect $tv 2>&1 | Out-String
  if ($con -match 'connected') {
    $res = & $T install -n $wgt -s "${tv}:26101" 2>&1 | Out-String
    if ($res -match 'successfully installed') { Write-Host "Instalado na TV: '$Nome' já aparece na lista de apps." }
    else { Write-Host "A instalação falhou. Detalhes:"; Write-Host $res }
  } else {
    Write-Host "A TV não aceitou a conexão. Coloque o Host PC IP do modo desenvolvedor em 192.168.1.53 e rode de novo."
  }
}
Write-Host ""
Write-Host "Para o botão no IPTV abrir este app, use no atalhos.json:"
Write-Host ("  {""n"": ""$Nome"", ""url"": ""$Url"", ""app"": ""$appId""}")

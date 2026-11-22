@echo off
chcp 65001 >nul
title Instalar Igor TV na TV
echo.
echo  ==============================================
echo   Instalar Igor TV na TV
echo  ==============================================
echo.
echo  Antes: na TV, Apps ^> 1 2 3 4 5 ^> Host PC IP = 192.168.1.53 ^> reiniciar.
echo.
set LOG=%~dp0instalacao.log
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1" > "%LOG%" 2>&1
C:\tizen-studio\tools\sdb.exe connect 192.168.1.171 >> "%LOG%" 2>&1
C:\tizen-studio\tools\ide\bin\tizen.bat install -n "%~dp0dist\IgorTV.wgt" -s 192.168.1.171:26101 >> "%LOG%" 2>&1
findstr /C:"successfully installed" "%LOG%" >nul
if %errorlevel%==0 (
  echo  PRONTO: Igor TV instalado. Abrindo na TV...
  C:\tizen-studio\tools\ide\bin\tizen.bat run -p IgorTVHome.IgorTV -s 192.168.1.171:26101 >> "%LOG%" 2>&1
  echo.
  echo  Agora volte o Host PC IP da TV para 127.0.0.1 e reinicie,
  echo  para o YouTube sem anuncios continuar funcionando.
) else (
  echo  NAO DEU CERTO. Confira se a TV esta ligada e com o IP 192.168.1.53.
  echo  Detalhes salvos em: %LOG%
)
echo.
pause

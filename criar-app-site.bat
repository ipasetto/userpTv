@echo off
chcp 65001 >nul
title Criar app de site para a TV
echo.
echo  ==============================================
echo   Criar app de site para a TV
echo  ==============================================
echo.
echo  O site vira um app separado na TV, com nome e icone proprios.
echo  Para instalar, o modo desenvolvedor da TV precisa estar com o IP 192.168.1.53.
echo.
set /p NOME= Nome do app: 
set /p URL= Endereco do site (comecando com https://): 
echo.
set LOG=%~dp0criar-app-site.log
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\criar-app-site.ps1" -Nome "%NOME%" -Url "%URL%" > "%LOG%" 2>&1
type "%LOG%"
echo.
echo  (Resultado salvo em %LOG%)
pause
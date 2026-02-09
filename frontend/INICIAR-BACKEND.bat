@echo off
echo ======================================
echo   INICIANDO BACKEND CRM
echo ======================================
echo.
cd /d "%~dp0..\backend"
set PATH=%PATH%;C:\Program Files\PostgreSQL\17\bin
echo Backend iniciando en http://localhost:5000
echo.
npm run dev
pause

@echo off
echo ======================================
echo   INICIANDO FRONTEND CRM
echo ======================================
echo.
cd /d "%~dp0"
echo Frontend iniciando en http://localhost:5173
echo.
npm run dev
pause

@echo off
REM Inicia el servidor backend en background usando tasklist para verificar
REM Este script no bloquea la terminal

cd /d "c:\Users\Gabriel\Desktop\bak\Entregable\backend"

REM Inicia node en una ventana separada y minimizada
start /min /b cmd /c "node server.js"

REM Espera un segundo para que se inicie
timeout /t 1 /nobreak

REM Verifica que está corriendo
tasklist | findstr "node.exe" >nul
if %errorlevel%==0 (
  echo Backend iniciado correctamente
  exit /b 0
) else (
  echo Error al iniciar backend
  exit /b 1
)

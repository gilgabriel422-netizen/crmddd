@echo off
cd /d "c:\Users\Gabriel\Desktop\bak\Entregable\backend"
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak>nul
node server.js > server.log 2>&1

#!/usr/bin/env node
/**
 * Script para iniciar ambos servidores (backend y frontend)
 * Sin bloquear la terminal interactiva
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Iniciando backends...\n');

const backendPath = path.join(__dirname, 'server.js');
const backendDir = __dirname;

// Inicia el backend
const backend = spawn('node', [backendPath], {
  cwd: backendDir,
  stdio: 'inherit',
  detached: false
});

backend.on('error', (err) => {
  console.error('❌ Error al iniciar backend:', err.message);
  process.exit(1);
});

backend.on('exit', (code) => {
  console.error(`⚠️  Backend terminó con código ${code}`);
  if (code !== 0) process.exit(code);
});

// Mantener el proceso vivo
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidores...');
  backend.kill();
  process.exit(0);
});

console.log('✅ Backend iniciado - Presiona CTRL+C para detener');

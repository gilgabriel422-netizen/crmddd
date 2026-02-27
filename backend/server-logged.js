#!/usr/bin/env node
/**
 * Backend server con logging a archivo
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Redirect console.log y console.error a archivo
const logFilePath = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
  const line = `[LOG ${new Date().toISOString()}] ${args.join(' ')}\n`;
  logStream.write(line);
  originalLog.apply(console, args);
};

console.error = function(...args) {
  const line = `[ERROR ${new Date().toISOString()}] ${args.join(' ')}\n`;
  logStream.write(line);
  originalError.apply(console, args);
};

// Ahora inicia el servidor
require('./server.js');

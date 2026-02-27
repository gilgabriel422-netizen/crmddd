#!/usr/bin/env node

// Simpler test to check if server.js can start

console.log('1. Testing server.js startup...');

try {
  require('./server.js');
  console.log('2. Server.js loaded successfully');
} catch (error) {
  console.error('❌ Error loading server.js:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

setTimeout(() => {
  console.log('3. Server still running after 5 seconds');
  process.exit(0);
}, 5000);

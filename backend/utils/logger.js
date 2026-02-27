const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'debug.log');

function appendLog(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, line);
  console.log(message);
}

module.exports = { appendLog };

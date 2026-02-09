const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'AdminPanel.jsx');
const code = fs.readFileSync(filePath, 'utf8');

let line = 1;
let col = 0;
let depth = 0;
let inS = false;
let inD = false;
let inT = false;
let inLine = false;
let inBlock = false;
let prev = '';

for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  const next = code[i + 1];

  if (inLine) {
    if (ch === '\n') {
      inLine = false;
      line++;
      col = 0;
    } else {
      col++;
    }
    prev = ch;
    continue;
  }

  if (inBlock) {
    if (ch === '*' && next === '/') {
      inBlock = false;
      i++;
      col += 2;
      prev = '/';
      continue;
    }
    if (ch === '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }
    prev = ch;
    continue;
  }

  if (!inS && !inD && !inT) {
    if (ch === '/' && next === '/') {
      inLine = true;
      i++;
      col += 2;
      prev = '/';
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlock = true;
      i++;
      col += 2;
      prev = '*';
      continue;
    }
  }

  if (!inD && !inT && ch === "'" && prev !== '\\') {
    inS = !inS;
  } else if (!inS && !inT && ch === '"' && prev !== '\\') {
    inD = !inD;
  } else if (!inS && !inD && ch === '`' && prev !== '\\') {
    inT = !inT;
  }

  if (!inS && !inD && !inT) {
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth < 0) {
        console.log(`EXTRA_CLOSE at ${line}:${col}`);
        process.exit(0);
      }
    }
  }

  if (ch === '\n') {
    line++;
    col = 0;
  } else {
    col++;
  }
  prev = ch;
}

console.log('FINAL_DEPTH', depth);

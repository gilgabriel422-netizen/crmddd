const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'AdminPanel.jsx');
const code = fs.readFileSync(filePath, 'utf8');

const anchor = 'const AdminPanel = () => {';
const anchorIndex = code.indexOf(anchor);
if (anchorIndex === -1) {
  console.log('ANCHOR_NOT_FOUND');
  process.exit(0);
}

const codeAfter = code.slice(anchorIndex + anchor.length);

let line = 1;
let col = 0;
let depth = 0;
let firstOpenSeen = false;
let firstCloseLine = null;
let inS = false;
let inD = false;
let inT = false;
let inLine = false;
let inBlock = false;
let prev = '';

const targetLine = 7249;
let adminDepth = 1;
let adminLine = code.slice(0, anchorIndex).split(/\r?\n/).length;

for (let i = 0; i < codeAfter.length; i++) {
  const ch = codeAfter[i];
  const next = codeAfter[i + 1];

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
      if (!firstOpenSeen) {
        firstOpenSeen = true;
      }
    } else if (ch === '}') {
      depth--;
      if (depth < 0) {
        console.log(`EXTRA_CLOSE at ${line}:${col}`);
        process.exit(0);
      }
      if (firstOpenSeen && depth === 0 && firstCloseLine === null) {
        firstCloseLine = line;
      }
    }
  }

  if (ch === '\n') {
    if (line === targetLine) {
      console.log('DEPTH_AT_LINE', targetLine, depth);
    }
    line++;
    adminLine++;
    col = 0;
  } else {
    col++;
  }
  prev = ch;
}

console.log('FINAL_DEPTH', depth);
console.log('ADMIN_START_LINE', adminLine);
if (firstCloseLine !== null) {
  console.log('FIRST_CLOSE_LINE', firstCloseLine);
}

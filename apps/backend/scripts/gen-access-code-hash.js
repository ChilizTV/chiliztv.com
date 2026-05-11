#!/usr/bin/env node
// Generates ACCESS_CODE_HASH for .env
// Usage: node scripts/gen-access-code-hash.js <plain-code>
// Output: paste the printed string as ACCESS_CODE_HASH=<output>

const { scryptSync, randomBytes } = require('node:crypto');

const code = process.argv[2];
if (!code || code.length < 4) {
  console.error('Usage: node scripts/gen-access-code-hash.js <plain-code>  (min 4 chars)');
  process.exit(1);
}

const salt = randomBytes(32);
const key = scryptSync(code.trim(), salt, 64, { N: 16384, r: 8, p: 1 });
console.log(salt.toString('hex') + ':' + key.toString('hex'));

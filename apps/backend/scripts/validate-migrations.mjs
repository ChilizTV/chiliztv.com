#!/usr/bin/env node
// Validates the migrations directory:
// - All files match NNN_description.sql (3+ digit prefix, underscore, non-empty description)
// - No duplicate sequence numbers
// - No gaps in the sequence (each number N is followed by N+1)
// Exits with code 1 and a descriptive message if any check fails.

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS_DIR = join(
  fileURLToPath(import.meta.url),
  '../../src/infrastructure/database/migrations'
);

const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
const PATTERN = /^(\d{3,})_(.+)\.sql$/;

const errors = [];
const numbers = [];

for (const file of files) {
  const match = PATTERN.exec(file);
  if (!match) {
    errors.push(`Invalid filename format: ${file} (expected NNN_description.sql)`);
    continue;
  }
  const num = parseInt(match[1], 10);
  if (numbers.includes(num)) {
    errors.push(`Duplicate migration number ${match[1]}: ${file}`);
  } else {
    numbers.push(num);
  }
}

numbers.sort((a, b) => a - b);

for (let i = 0; i < numbers.length - 1; i++) {
  if (numbers[i + 1] !== numbers[i] + 1) {
    errors.push(`Gap in migration sequence: ${numbers[i]} → ${numbers[i + 1]} (missing ${numbers[i] + 1})`);
  }
}

if (errors.length > 0) {
  console.error('Migration validation failed:');
  errors.forEach(e => console.error(`  ✗ ${e}`));
  process.exit(1);
}

console.log(`Migration sequence valid — ${numbers.length} migrations (${numbers[0]}–${numbers.at(-1)})`);

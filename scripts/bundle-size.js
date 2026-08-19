import { readFileSync, statSync } from 'fs';
import { gzipSync } from 'zlib';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const files = [
  'app.html',
  'manifest.json',
  'sw.js',
  'src/style.css',
  'src/data.js',
  'src/ui.js',
  'src/pages.js',
  'src/sober.js',
  'src/buddy.js',
  'src/kingdom.js',
];

let totalRaw = 0;
let totalGzip = 0;

console.log('\n  Bundle Size Report\n');
console.log('  ' + '-'.repeat(60));
console.log('  ' + 'File'.padEnd(35) + 'Raw'.padEnd(12) + 'Gzip'.padEnd(12));
console.log('  ' + '-'.repeat(60));

for (const f of files) {
  const fp = resolve(root, f);
  try {
    const buf = readFileSync(fp);
    const raw = buf.length;
    const gz = gzipSync(buf).length;
    totalRaw += raw;
    totalGzip += gz;
    console.log('  ' + f.padEnd(35) + String(raw).padStart(8) + ' B'.padEnd(4) + String(gz).padStart(8) + ' B');
  } catch (e) {
    console.log('  ' + f.padEnd(35) + '  — not found');
  }
}

console.log('  ' + '-'.repeat(60));
console.log('  ' + 'Total'.padEnd(35) + String(totalRaw).padStart(8) + ' B'.padEnd(4) + String(totalGzip).padStart(8) + ' B');
console.log('\n');

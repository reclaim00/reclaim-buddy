import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';

const FILES = [
  'src/style.css',
  'src/data.js',
  'src/buddy.js',
  'src/sober.js',
  'src/pages.js',
  'src/kingdom.js',
  'src/ui.js',
  'src/mfa.js',
  'manifest.json',
  'sw.js',
  'globe-icon.png',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'privacy.html',
  'terms.html',
];

await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });

for (const f of FILES) {
  await cp(f, 'www/' + f, { recursive: true });
}

const app = await readFile('app.html', 'utf8');
await writeFile('www/app.html', app);
await writeFile('www/index.html', app);

console.log('www bundle built');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { normalizeJournalEntries, journalMoodLabel } = require('../src/data-validation.js');

test('journal migration keeps valid records and removes malformed mood values', () => {
  const input = [
    { text: 'valid', mood: 3 },
    { text: 'legacy numeric mood', mood: '5' },
    { text: 'bad mood', mood: 9 },
    { text: 'invalid boolean mood', mood: true },
    { text: 'no mood' },
    'older text-only entry',
    null,
  ];
  const result = normalizeJournalEntries(input);
  assert.deepEqual(result.slice(0, 5), [
    { text: 'valid', mood: 3 },
    { text: 'legacy numeric mood', mood: 5 },
    { text: 'bad mood' },
    { text: 'invalid boolean mood' },
    { text: 'no mood' },
  ]);
  assert.deepEqual(result[5], { text: 'older text-only entry', date: '' });
  assert.equal(result.length, 6);
  assert.equal(input[2].mood, 9, 'migration does not mutate the original snapshot');
});

test('journal migration handles non-array and object-shaped invalid entries', () => {
  assert.deepEqual(normalizeJournalEntries(null), []);
  assert.deepEqual(normalizeJournalEntries({ text: 'not an array' }), []);
  assert.deepEqual(normalizeJournalEntries([[], false, 0]), []);
});

test('journal mood labels render valid values and safely ignore invalid values', () => {
  const moods = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'].map((label) => ({ label }));
  assert.equal(journalMoodLabel(1, moods), ' &middot; Terrible');
  assert.equal(journalMoodLabel('5', moods), ' &middot; Great');
  for (const value of [undefined, null, true, {}, 0, 6, -1, '', 'bad', 2.5]) {
    assert.equal(journalMoodLabel(value, moods), '');
  }
});

test('web startup loads and caches data validation before application data', () => {
  const app = fs.readFileSync('app.html', 'utf8');
  const build = fs.readFileSync('scripts/build-web.mjs', 'utf8');
  const serviceWorker = fs.readFileSync('sw.js', 'utf8');
  assert.ok(app.indexOf('src/data-validation.js') < app.indexOf('src/data.js'));
  assert.match(build, /'src\/data-validation\.js'/);
  assert.match(serviceWorker, /baseUrl\('src\/data-validation\.js'\)/);
});

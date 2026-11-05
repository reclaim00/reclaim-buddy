const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('src/style.css', 'utf8');
const html = fs.readFileSync('app.html', 'utf8');
const data = fs.readFileSync('src/data.js', 'utf8');

test('primary SOS, Profile, and tab controls retain usable iPhone touch targets', () => {
  assert.match(css, /\.sos-btn-float\{[^}]*min-height:44px;min-width:44px/);
  assert.match(css, /\.profile-btn-float\{[^}]*width:44px;height:44px/);
  assert.match(css, /\.tab\{min-height:52px/);
  assert.match(css, /env\(safe-area-inset-bottom,0px\)/);
});

test('sync failure retry can be reached and activated from the keyboard', () => {
  assert.match(html, /onkeydown="if\(_syncStatus==='error'.*syncToFirestore\(\)\}/);
  assert.match(data, /el\.tabIndex = retryAvailable \? 0 : -1/);
  assert.match(data, /Cloud sync failed\. Activate to retry\./);
});

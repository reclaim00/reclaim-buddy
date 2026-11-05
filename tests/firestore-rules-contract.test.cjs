const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const rules = fs.readFileSync('firestore.rules', 'utf8');
function matchBlock(collection) {
  const escaped = collection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rules.match(new RegExp(`match \\/${escaped}\\/\\{[^}]+\\}\\s*\\{([\\s\\S]*?)\\n    \\}`, 'm'));
  assert.ok(match, `rules contain a match block for ${collection}`);
  return match[1];
}

test('recovery snapshots and account profiles are restricted to their owner', () => {
  for (const collection of ['appData', 'users', 'pushSubscriptions']) {
    const block = matchBlock(collection);
    assert.match(block, /allow read, write:\s*if request\.auth != null && request\.auth\.token\.email == email;/);
  }
});

test('shared progress requires an explicit participant and an active accepted connection', () => {
  const block = matchBlock('progress');
  assert.match(block, /request\.auth\.token\.email == email/);
  assert.match(block, /request\.auth\.token\.email in resource\.data\.participants/);
  assert.match(block, /\.data\.accepted == true/);
  assert.match(block, /\.data\.ended != true/);
  assert.match(block, /allow write:\s*if request\.auth != null && request\.auth\.token\.email == email;/);
});

test('partner messages are readable only by conversation participants and cannot be updated', () => {
  const block = matchBlock('messages');
  assert.match(block, /resource\.data\.from == request\.auth\.token\.email/);
  assert.match(block, /resource\.data\.to == request\.auth\.token\.email/);
  assert.match(block, /allow update:\s*if false;/);
});

test('partner matching queues, blocks, and reports have no direct client rule', () => {
  assert.doesNotMatch(rules, /match \/(?:partnerQueue|partnerBlocks|partnerReports)\//);
  assert.match(rules, /partnerQueue, partnerBlocks, and partnerReports are intentionally unavailable to clients/);
});

import { describe, it, expect, beforeEach } from 'vitest';

const PAGES = ['home', 'journal', 'track', 'care', 'reflect', 'more', 'mywhy'];

beforeEach(() => {
  localStorage.clear();
  global.D = global.defaultData();
  global.AUTH_USER = null;
  global.AUTH_EMAIL = null;
  global.ENC_KEY = null;
  global.ENC_UNLOCK_CALLBACK = null;
  global.MORE_SUB_PAGES = ['profile', 'warchest', 'shop', 'achievements', 'insights', 'alliances'];
});

describe('a11y — critical violations', () => {
  PAGES.forEach(page => {
    it(page + ' has no critical axe violations', async () => {
      const html = global.renderPage(page);
      const results = await global.runAxeOnPage(page, html);
      // Only fail on critical/serious violations
      const violations = results.violations.filter(v =>
        ['critical', 'serious'].includes(v.impact)
      );
      if (violations.length > 0) {
        const msg = violations.map(v =>
          `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.map(n => n.html).join('\n    ')}`
        ).join('\n');
        expect(violations, `a11y violations on ${page}:\n${msg}`).toHaveLength(0);
      }
    });
  });
});

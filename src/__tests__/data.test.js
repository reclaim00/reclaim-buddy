import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  global.D = undefined;
  global.AUTH_USER = null;
  global.AUTH_EMAIL = null;
  global.pg = 'home';
});

describe('t()', () => {
  it('returns the key when no language is set', () => {
    global.D = {};
    expect(global.t('Home')).toBe('Home');
  });

  it('returns the key when language is English', () => {
    global.D = { language: 'English' };
    expect(global.t('Home')).toBe('Home');
  });

  it('returns the translation for a non-English language', () => {
    global.D = { language: 'Español' };
    expect(global.t('Home')).toBe('Inicio');
  });

  it('returns the key when no translation exists', () => {
    global.D = { language: 'Français' };
    expect(global.t('SomeNonexistentKey')).toBe('SomeNonexistentKey');
  });
});

describe('dataKey()', () => {
  it('returns "rc_data_local" when no user', () => {
    expect(global.dataKey()).toBe('rc_data_local');
  });

  it('sanitizes email for the key', () => {
    global.AUTH_USER = 'test@example.com';
    expect(global.dataKey()).toBe('rc_data_testexamplecom');
  });

  it('falls back to "local" for falsy user', () => {
    global.AUTH_USER = '';
    expect(global.dataKey()).toBe('rc_data_local');
  });
});

describe('defaultData()', () => {
  it('returns an object', () => {
    const d = global.defaultData();
    expect(d).toBeTruthy();
    expect(typeof d).toBe('object');
  });

  it('contains journal, moods, habits, cravings arrays', () => {
    const d = global.defaultData();
    expect(Array.isArray(d.journal)).toBe(true);
    expect(Array.isArray(d.moods)).toBe(true);
    expect(Array.isArray(d.habits)).toBe(true);
    expect(Array.isArray(d.cravings)).toBe(true);
  });
});

describe('validateData()', () => {
  it('fills in missing journal and moods', () => {
    const result = global.validateData({ journal: null, moods: undefined });
    expect(Array.isArray(result.journal)).toBe(true);
    expect(Array.isArray(result.moods)).toBe(true);
    expect(result.journal).toEqual([]);
    expect(result.moods).toEqual([]);
  });

  it('preserves existing data', () => {
    const data = { journal: [{ id: 1, text: 'test' }], moods: [] };
    const result = global.validateData(data);
    expect(result.journal).toEqual([{ id: 1, text: 'test' }]);
  });

  it('keeps _version if present', () => {
    const result = global.validateData({ _version: '1.0' });
    expect(result._version).toBe('1.0');
  });
});

describe('saveDataSilent', () => {
  function stubMissing() {
    const stubs = {};
    ['updateSchillings', 'applyTheme', 'syncToFirestore', 'showToast'].forEach(k => {
      stubs[k] = global[k];
      global[k] = () => {};
    });
    return () => {
      Object.keys(stubs).forEach(k => { global[k] = stubs[k]; });
    };
  }

  it('persists data to localStorage', () => {
    const restore = stubMissing();
    global.D = { journal: [], moods: [], habits: [], cravings: [], settings: {} };
    global.saveDataSilent();
    const saved = JSON.parse(localStorage.getItem('rc_data_local'));
    expect(saved).toBeTruthy();
    expect(Array.isArray(saved.journal)).toBe(true);
    restore();
  });

  it('does not throw for minimal data', () => {
    const restore = stubMissing();
    global.D = { journal: [], moods: [] };
    expect(() => global.saveDataSilent()).not.toThrow();
    restore();
  });
});

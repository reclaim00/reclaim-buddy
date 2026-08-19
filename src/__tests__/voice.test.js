import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  global.D = global.defaultData();
  global.D.streak = 5;
  global.AUTH_EMAIL = 'me@example.com';
});

describe('dataURLToBlob()', () => {
  it('converts a valid data URL into a Blob with the right type', () => {
    const data = 'data:audio/webm;base64,' + btoa('hello voice');
    const blob = global.dataURLToBlob(data);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/webm');
    expect(blob.size).toBe('hello voice'.length);
  });

  it('returns null for malformed input', () => {
    expect(global.dataURLToBlob('not-a-data-url')).toBeNull();
    expect(global.dataURLToBlob('')).toBeNull();
  });
});

describe('speech helpers', () => {
  it('reports no speech support in environments without speechSynthesis', () => {
    global.window.speechSynthesis = undefined;
    expect(global.speechSupported()).toBe(false);
    expect(global.speakText('hello')).toBe(false);
  });
});

describe('buildVoiceSummary()', () => {
  it('returns a summary object with html and plain text', () => {
    const result = global.buildVoiceSummary('I felt anxious at work today, but then I took a walk and felt a little better.');
    expect(typeof result.html).toBe('string');
    expect(typeof result.plain).toBe('string');
    expect(result.html.length).toBeGreaterThan(0);
    expect(result.html).toContain('Entry Overview');
  });

  it('strips markup from the plain text version', () => {
    const result = global.buildVoiceSummary('I felt anxious at work today.');
    expect(result.plain).not.toContain('<');
    expect(result.plain).not.toContain('&#9755;');
    expect(result.plain).not.toMatch(/&#\d+;/);
    expect(result.plain.trim().length).toBeGreaterThan(0);
  });

  it('does not throw on empty or whitespace text', () => {
    expect(() => global.buildVoiceSummary('')).not.toThrow();
    expect(() => global.buildVoiceSummary('   ')).not.toThrow();
  });
});

describe('persistVoiceBlob()', () => {
  it('falls back to localStorage when IndexedDB is unavailable', async () => {
    global.window.indexedDB = undefined;
    global._voiceBlob = new Blob(['voice data here'], { type: 'audio/webm' });
    global._voiceSec = 4;
    const ok = await global.persistVoiceBlob();
    expect(ok).toBe(true);
    expect(global._voiceKey).toBeTruthy();
    const stored = localStorage.getItem('rc_voice_' + global._voiceKey);
    expect(stored).toBeTruthy();
    expect(stored.indexOf('data:audio/webm;base64,')).toBe(0);
  });

  it('resolves false when no blob is recorded', async () => {
    global._voiceBlob = null;
    const ok = await global.persistVoiceBlob();
    expect(ok).toBe(false);
  });
});

describe('getVoiceBlob()', () => {
  it('reads a legacy localStorage blob when IndexedDB is unavailable', async () => {
    global.window.indexedDB = undefined;
    const data = 'data:audio/webm;base64,' + btoa('legacy clip');
    localStorage.setItem('rc_voice_vj_test1', data);
    const blob = await global.getVoiceBlob('vj_test1');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/webm');
  });

  it('returns null when nothing is stored', async () => {
    global.window.indexedDB = undefined;
    const blob = await global.getVoiceBlob('vj_missing');
    expect(blob).toBeNull();
  });
});

describe('deleteVoiceKey()', () => {
  it('removes the localStorage entry without throwing', async () => {
    localStorage.setItem('rc_voice_vj_delete', 'data:audio/webm;base64,xxx');
    expect(() => global.deleteVoiceKey('vj_delete')).not.toThrow();
    expect(localStorage.getItem('rc_voice_vj_delete')).toBeNull();
  });

  it('is a no-op for empty keys', () => {
    expect(() => global.deleteVoiceKey('')).not.toThrow();
    expect(() => global.deleteVoiceKey(null)).not.toThrow();
  });
});
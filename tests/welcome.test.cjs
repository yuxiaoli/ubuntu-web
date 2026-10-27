const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const baseNotes = require('../lib/notes-storage.cjs');
const { STARTER_NOTES } = baseNotes;
const SYNTHETIC_PREVIOUS = 'Synthetic obsolete sample\n\nWith a second paragraph.\n';
const synthetic = baseNotes.createNotesStorage({ byteLength: Buffer.byteLength(SYNTHETIC_PREVIOUS), sha256: createHash('sha256').update(SYNTHETIC_PREVIOUS).digest('hex') });
const testNotes = { ...baseNotes, ...synthetic, SYNTHETIC_PREVIOUS };

test('the starter is the exact approved UTF-8 Git blob, including all six paragraphs and final link', () => {
  const bytes = Buffer.from(STARTER_NOTES, 'utf8');
  assert.equal(bytes.length, 525);
  assert.equal(STARTER_NOTES.split('\n\n').length, 6);
  assert.ok(STARTER_NOTES.endsWith('Keep exploring: https://vectorindex.cloud'));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '8cfade6f56f8046d1a2deae329e43d3f024095917d18dc11e436b095d9c9fb36');
  assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), 'fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7');
});

function memoryStorage(entries = []) {
  const data = new Map(entries);
  const writes = [];
  return { data, writes, getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => { writes.push([key, value]); data.set(key, value); } };
}

test('the exact previous default migrates once and later intentional saves of that text survive', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, SYNTHETIC_PREVIOUS, loadNotes, saveNotes } = testNotes;
  const storage = memoryStorage([[NOTES_KEY, SYNTHETIC_PREVIOUS]]);
  assert.equal(loadNotes(storage), STARTER_NOTES);
  assert.equal(storage.data.get(NOTES_KEY), STARTER_NOTES);
  assert.equal(storage.data.get(WELCOME_VERSION_KEY), WELCOME_VERSION);
  storage.writes.length = 0;
  assert.equal(loadNotes(storage), STARTER_NOTES);
  assert.equal(storage.writes.length, 0);
  saveNotes(storage, SYNTHETIC_PREVIOUS);
  storage.writes.length = 0;
  assert.equal(loadNotes(storage), SYNTHETIC_PREVIOUS);
  assert.equal(storage.writes.length, 0);
});

test('failed migration writes preserve readable legacy notes and a recorded attempt is not repeated', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, SYNTHETIC_PREVIOUS, loadNotes } = testNotes;
  for (const blockedKey of [WELCOME_VERSION_KEY, NOTES_KEY]) {
    const storage = memoryStorage([[NOTES_KEY, SYNTHETIC_PREVIOUS]]);
    const setItem = storage.setItem;
    storage.setItem = (key, value) => { if (key === blockedKey) throw new Error('Storage unavailable'); setItem(key, value); };
    assert.equal(loadNotes(storage), SYNTHETIC_PREVIOUS);
    assert.equal(storage.data.get(NOTES_KEY), SYNTHETIC_PREVIOUS);
    if (blockedKey === NOTES_KEY) {
      storage.writes.length = 0;
      assert.equal(loadNotes(storage), SYNTHETIC_PREVIOUS);
      assert.equal(storage.writes.length, 0);
    }
  }
});

test('a handled note whose key was removed stays absent instead of recreating the welcome', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, loadNotes } = testNotes;
  const storage = memoryStorage([[WELCOME_VERSION_KEY, WELCOME_VERSION], ['renamed-personal-note', 'My preserved text']]);
  assert.equal(loadNotes(storage), '');
  assert.equal(storage.data.has(NOTES_KEY), false);
  assert.equal(storage.data.get('renamed-personal-note'), 'My preserved text');
  assert.equal(storage.writes.length, 0);
});

test('fresh storage is read-only and edited, empty, marked and renamed-like values remain untouched', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, SYNTHETIC_PREVIOUS, loadNotes } = testNotes;
  const fresh = memoryStorage([['renamed-note', 'Keep this document']]);
  assert.equal(loadNotes(fresh), STARTER_NOTES);
  assert.equal(fresh.data.has(NOTES_KEY), false);
  assert.equal(fresh.data.get('renamed-note'), 'Keep this document');
  assert.equal(fresh.writes.length, 0);
  for (const value of ['', 'My edited notes', SYNTHETIC_PREVIOUS + ' ', SYNTHETIC_PREVIOUS.slice(0, -1), SYNTHETIC_PREVIOUS.replace(/\n/g, '\r\n'), 'Renamed note\n' + SYNTHETIC_PREVIOUS]) {
    const storage = memoryStorage([[NOTES_KEY, value], ['other-os-note', 'Keep']]);
    assert.equal(loadNotes(storage), value);
    assert.equal(storage.data.get(NOTES_KEY), value);
    assert.equal(storage.data.get('other-os-note'), 'Keep');
    assert.equal(storage.writes.length, 0);
  }
  for (const marker of ['already-handled', '']) {
    const storage = memoryStorage([[NOTES_KEY, SYNTHETIC_PREVIOUS], [WELCOME_VERSION_KEY, marker]]);
    assert.equal(loadNotes(storage), SYNTHETIC_PREVIOUS);
    assert.equal(storage.writes.length, 0);
  }
});

test('storage read errors and failed explicit saves cannot replace readable user text', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, SYNTHETIC_PREVIOUS, loadNotes, saveNotes } = testNotes;
  for (const value of [SYNTHETIC_PREVIOUS, 'User text', '']) {
    const storage = memoryStorage([[NOTES_KEY, value]]);
    const getItem = storage.getItem;
    storage.getItem = key => { if (key === WELCOME_VERSION_KEY) throw new Error('Metadata read blocked'); return getItem(key); };
    assert.equal(loadNotes(storage), value);
    assert.equal(storage.writes.length, 0);
  }
  const unreadable = memoryStorage();
  unreadable.getItem = () => { throw new Error('Storage read blocked'); };
  assert.throws(() => loadNotes(unreadable), /Storage read blocked/);
  assert.equal(unreadable.writes.length, 0);
  for (const blockedKey of [WELCOME_VERSION_KEY, NOTES_KEY]) {
    const storage = memoryStorage([[NOTES_KEY, 'Original user text']]);
    const setItem = storage.setItem;
    storage.setItem = (key, value) => { if (key === blockedKey) throw new Error('Save blocked'); setItem(key, value); };
    assert.throws(() => saveNotes(storage, 'Edited text'), /Save blocked/);
    assert.equal(storage.data.get(NOTES_KEY), 'Original user text');
    assert.equal(loadNotes(storage), 'Original user text');
  }
});

test('migration rechecks the note after metadata changes so intervening edits, empties and removals survive', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, SYNTHETIC_PREVIOUS, loadNotes } = testNotes;
  for (const changed of ['Another tab edited this', '', null]) {
    const storage = memoryStorage([[NOTES_KEY, SYNTHETIC_PREVIOUS]]);
    const setItem = storage.setItem;
    storage.setItem = (key, value) => {
      setItem(key, value);
      if (key === WELCOME_VERSION_KEY) {
        if (changed === null) storage.data.delete(NOTES_KEY);
        else storage.data.set(NOTES_KEY, changed);
      }
    };
    assert.equal(loadNotes(storage), changed === null ? '' : changed);
    assert.equal(storage.getItem(NOTES_KEY), changed);
    assert.equal(storage.writes.filter(([key]) => key === NOTES_KEY).length, 0);
  }
});

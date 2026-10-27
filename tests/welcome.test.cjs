const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { STARTER_NOTES } = require('../lib/notes-storage.cjs');

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
  const { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, PREVIOUS_STARTER_NOTES, loadNotes, saveNotes } = require('../lib/notes-storage.cjs');
  assert.equal(createHash('sha256').update(PREVIOUS_STARTER_NOTES).digest('hex'), '4381fa036fa122f67a3f6869e91fd336efb7deb6f990d93e465d022daf34e758');
  const storage = memoryStorage([[NOTES_KEY, PREVIOUS_STARTER_NOTES]]);
  assert.equal(loadNotes(storage), STARTER_NOTES);
  assert.equal(storage.data.get(NOTES_KEY), STARTER_NOTES);
  assert.equal(storage.data.get(WELCOME_VERSION_KEY), WELCOME_VERSION);
  storage.writes.length = 0;
  assert.equal(loadNotes(storage), STARTER_NOTES);
  assert.equal(storage.writes.length, 0);
  saveNotes(storage, PREVIOUS_STARTER_NOTES);
  storage.writes.length = 0;
  assert.equal(loadNotes(storage), PREVIOUS_STARTER_NOTES);
  assert.equal(storage.writes.length, 0);
});

test('failed migration writes preserve readable legacy notes and a recorded attempt is not repeated', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, PREVIOUS_STARTER_NOTES, loadNotes } = require('../lib/notes-storage.cjs');
  for (const blockedKey of [WELCOME_VERSION_KEY, NOTES_KEY]) {
    const storage = memoryStorage([[NOTES_KEY, PREVIOUS_STARTER_NOTES]]);
    const setItem = storage.setItem;
    storage.setItem = (key, value) => { if (key === blockedKey) throw new Error('Storage unavailable'); setItem(key, value); };
    assert.equal(loadNotes(storage), PREVIOUS_STARTER_NOTES);
    assert.equal(storage.data.get(NOTES_KEY), PREVIOUS_STARTER_NOTES);
    if (blockedKey === NOTES_KEY) {
      storage.writes.length = 0;
      assert.equal(loadNotes(storage), PREVIOUS_STARTER_NOTES);
      assert.equal(storage.writes.length, 0);
    }
  }
});

test('a handled note whose key was removed stays absent instead of recreating the welcome', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, loadNotes } = require('../lib/notes-storage.cjs');
  const storage = memoryStorage([[WELCOME_VERSION_KEY, WELCOME_VERSION], ['renamed-personal-note', 'My preserved text']]);
  assert.equal(loadNotes(storage), '');
  assert.equal(storage.data.has(NOTES_KEY), false);
  assert.equal(storage.data.get('renamed-personal-note'), 'My preserved text');
  assert.equal(storage.writes.length, 0);
});

test('fresh storage is read-only and edited, empty, marked and renamed-like values remain untouched', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, PREVIOUS_STARTER_NOTES, loadNotes } = require('../lib/notes-storage.cjs');
  const fresh = memoryStorage([['renamed-note', 'Keep this document']]);
  assert.equal(loadNotes(fresh), STARTER_NOTES);
  assert.equal(fresh.data.has(NOTES_KEY), false);
  assert.equal(fresh.data.get('renamed-note'), 'Keep this document');
  assert.equal(fresh.writes.length, 0);
  for (const value of ['', 'My edited notes', PREVIOUS_STARTER_NOTES + ' ', PREVIOUS_STARTER_NOTES.slice(0, -1), PREVIOUS_STARTER_NOTES.replace(/\n/g, '\r\n'), 'Renamed note\n' + PREVIOUS_STARTER_NOTES]) {
    const storage = memoryStorage([[NOTES_KEY, value], ['other-os-note', 'Keep']]);
    assert.equal(loadNotes(storage), value);
    assert.equal(storage.data.get(NOTES_KEY), value);
    assert.equal(storage.data.get('other-os-note'), 'Keep');
    assert.equal(storage.writes.length, 0);
  }
  for (const marker of ['already-handled', '']) {
    const storage = memoryStorage([[NOTES_KEY, PREVIOUS_STARTER_NOTES], [WELCOME_VERSION_KEY, marker]]);
    assert.equal(loadNotes(storage), PREVIOUS_STARTER_NOTES);
    assert.equal(storage.writes.length, 0);
  }
});

test('storage read errors and failed explicit saves cannot replace readable user text', () => {
  const { NOTES_KEY, WELCOME_VERSION_KEY, PREVIOUS_STARTER_NOTES, loadNotes, saveNotes } = require('../lib/notes-storage.cjs');
  for (const value of [PREVIOUS_STARTER_NOTES, 'User text', '']) {
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
  const { NOTES_KEY, WELCOME_VERSION_KEY, PREVIOUS_STARTER_NOTES, loadNotes } = require('../lib/notes-storage.cjs');
  for (const changed of ['Another tab edited this', '', null]) {
    const storage = memoryStorage([[NOTES_KEY, PREVIOUS_STARTER_NOTES]]);
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

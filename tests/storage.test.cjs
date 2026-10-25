const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadNotes, saveNotes } = require('../lib/notes-storage.cjs');
test('saved notes, including an intentionally empty note, survive starter initialization', () => {
  const data = new Map([['ubuntu-sean-notes-v1', 'My existing notes']]);
  const storage = { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k, v) => data.set(k, v) };
  assert.equal(loadNotes(storage), 'My existing notes');
  saveNotes(storage, '');
  assert.equal(loadNotes(storage), '');
});

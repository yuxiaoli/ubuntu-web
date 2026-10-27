const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const notes = require('../lib/notes-storage.cjs');

test('production migration exports only a length and one-way fingerprint, never the old text', () => {
  assert.equal(Object.hasOwn(notes, 'PREVIOUS_STARTER_NOTES'), false);
  assert.deepEqual(notes.PREVIOUS_STARTER_FINGERPRINT, {
    byteLength: 550,
    sha256: '4381fa036fa122f67a3f6869e91fd336efb7deb6f990d93e465d022daf34e758',
  });
});

test('UTF-8 fingerprint detection agrees with native SHA-256 across synthetic vectors and block boundaries', () => {
  const { createNotesStorage } = notes;
  for (const text of ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(63), 'a'.repeat(64), 'a'.repeat(65), 'a'.repeat(128), '\u4f60\u597d \ud83d\ude00\n', 'line one\nline two\n']) {
    const fingerprint = { byteLength: Buffer.byteLength(text, 'utf8'), sha256: createHash('sha256').update(text).digest('hex') };
    const matcher = createNotesStorage(fingerprint).isPreviousStarter;
    assert.equal(matcher(text), true);
    assert.equal(matcher(text + ' '), false);
    assert.equal(matcher(null), false);
    if (text.length) assert.equal(matcher('b' + text.slice(1)), false);
  }
});

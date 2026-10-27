const NOTES_KEY = 'ubuntu-sean-notes-v1';
const WELCOME_VERSION_KEY = 'ubuntu-sean-notes-welcome-version';
const WELCOME_VERSION = '2026-10-27:fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7';
const STARTER_NOTES = require('./welcome-text.json');
const { sha256 } = require('@noble/hashes/sha256');
const { bytesToHex, utf8ToBytes } = require('@noble/hashes/utils');
const PREVIOUS_STARTER_FINGERPRINT = Object.freeze({
  byteLength: 550,
  sha256: '4381fa036fa122f67a3f6869e91fd336efb7deb6f990d93e465d022daf34e758',
});

// The configurable fingerprint lets tests use synthetic content without retaining old personal text.
function createNotesStorage(fingerprint = PREVIOUS_STARTER_FINGERPRINT) {
  function isPreviousStarter(text) {
    if (typeof text !== 'string' || text.length > fingerprint.byteLength) return false;
    const bytes = utf8ToBytes(text);
    return bytes.length === fingerprint.byteLength && bytesToHex(sha256(bytes)) === fingerprint.sha256;
  }
  function loadNotes(storage) {
    const saved = storage.getItem(NOTES_KEY);
    if (saved === null) {
      // A version marker plus a missing key is evidence of removal; never recreate storage.
      try { return storage.getItem(WELCOME_VERSION_KEY) === null ? STARTER_NOTES : ''; }
      catch { return ''; }
    }
    if (!isPreviousStarter(saved)) return saved;
    try {
      if (storage.getItem(WELCOME_VERSION_KEY) !== null) return saved;
      // Mark first: if the note write fails, preserve the old string and never retry it.
      storage.setItem(WELCOME_VERSION_KEY, WELCOME_VERSION);
      const current = storage.getItem(NOTES_KEY);
      if (!isPreviousStarter(current)) return current === null ? '' : current;
      storage.setItem(NOTES_KEY, STARTER_NOTES);
      return STARTER_NOTES;
    } catch {
      return saved;
    }
  }
  function saveNotes(storage, text) {
    // Explicit edits must never be migrated, including an intentional reuse of old content.
    storage.setItem(WELCOME_VERSION_KEY, WELCOME_VERSION);
    storage.setItem(NOTES_KEY, text);
  }
  return { loadNotes, saveNotes, isPreviousStarter };
}
const { loadNotes, saveNotes } = createNotesStorage();
module.exports = { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, STARTER_NOTES, PREVIOUS_STARTER_FINGERPRINT, createNotesStorage, loadNotes, saveNotes };

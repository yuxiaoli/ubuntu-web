const NOTES_KEY = 'ubuntu-sean-notes-v1';
const WELCOME_VERSION_KEY = 'ubuntu-sean-notes-welcome-version';
const WELCOME_VERSION = '2026-10-27:fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7';
const STARTER_NOTES = require('./welcome-text.json');
const PREVIOUS_STARTER_NOTES = `Welcome to Sean's Ubuntu desktop

This is a browser simulation of Ubuntu 20.04, personalized for Sean (Yuxiao Li).

Workspace
• Home: https://vectorindex.cloud
• GitHub: https://github.com/yuxiaoli
• Source: https://github.com/yuxiaoli/ubuntu-web

Try Terminal: help, ls, pwd, echo, clear.
Use Settings to choose a wallpaper, or Browser for your bookmarks.

Your notes stay in this browser on this device. They are not sent to a server.
Keep a backup of anything important using Download.

Original Ubuntu simulation: Vivek Patel, MIT license.
`;
function loadNotes(storage) {
  const saved = storage.getItem(NOTES_KEY);
  if (saved === null) {
    // No document model exists. A version marker plus missing key is deletion evidence.
    try { return storage.getItem(WELCOME_VERSION_KEY) === null ? STARTER_NOTES : ''; }
    catch { return ''; }
  }
  if (saved !== PREVIOUS_STARTER_NOTES) return saved;
  try {
    if (storage.getItem(WELCOME_VERSION_KEY) !== null) return saved;
    // Mark first: if the note write fails, preserve the old string and never retry it.
    storage.setItem(WELCOME_VERSION_KEY, WELCOME_VERSION);
    const current = storage.getItem(NOTES_KEY);
    if (current !== PREVIOUS_STARTER_NOTES) return current === null ? '' : current;
    storage.setItem(NOTES_KEY, STARTER_NOTES);
    return STARTER_NOTES;
  } catch {
    return saved;
  }
}
function saveNotes(storage, text) {
  // Explicit edits, even a deliberate copy of the old welcome, must never be migrated.
  storage.setItem(WELCOME_VERSION_KEY, WELCOME_VERSION);
  storage.setItem(NOTES_KEY, text);
}
module.exports = { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, STARTER_NOTES, PREVIOUS_STARTER_NOTES, loadNotes, saveNotes };

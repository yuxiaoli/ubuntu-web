const NOTES_KEY = 'ubuntu-sean-notes-v1';
const STARTER_NOTES = `Welcome to Sean's Ubuntu desktop

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
  return saved === null ? STARTER_NOTES : saved;
}
function saveNotes(storage, text) { storage.setItem(NOTES_KEY, text); }
module.exports = { NOTES_KEY, STARTER_NOTES, loadNotes, saveNotes };

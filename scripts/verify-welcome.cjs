const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');

const target = process.argv[2] || 'out';
const expectedCommit = process.argv[3];
const remote = /^https:\/\//.test(target);
const blob = 'fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7';
async function read(resource) {
  if (!remote) return fs.readFile(path.join(target, resource), 'utf8');
  const response = await fetch(new URL(resource, target), { signal: AbortSignal.timeout(20000), headers: { 'Cache-Control': 'no-cache' } });
  assert.equal(response.status, 200, resource);
  return response.text();
}
function storage(entries = []) {
  const data = new Map(entries), writes = [];
  return { data, writes, getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => { writes.push([key, value]); data.set(key, value); } };
}
(async () => {
  const html = await read('index.html');
  const script = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]).find(src => /\/pages\/index-[^/]+\.js$/.test(src));
  assert.ok(script, 'index.html must reference its actual application chunk');
  const resource = script.replace(/^\/ubuntu-web\//, '');
  const code = await read(resource);
  // Only register webpack factories; never run its page callback or browser/UI code.
  const modules = {};
  vm.runInNewContext(code, { self: { webpackChunk_N_E: { push: entry => Object.assign(modules, entry[1]) } } }, { timeout: 1000 });
  const id = Object.keys(modules).find(key => modules[key].toString().includes('ubuntu-sean-notes-v1'));
  assert.ok(id, 'served Notes storage factory must be present');
  const cache = {};
  function requireModule(moduleId) {
    if (cache[moduleId]) return cache[moduleId].exports;
    assert.ok(modules[moduleId], `Missing pure storage dependency ${moduleId}`);
    const module = cache[moduleId] = { exports: {} };
    // Run only the isolated storage/JSON factory, without browser or Node capabilities.
    vm.runInNewContext('(' + modules[moduleId].toString() + ')(module, module.exports, requireModule)', { module, requireModule }, { timeout: 1000 });
    return module.exports;
  }
  const notes = requireModule(id);
  const { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, PREVIOUS_STARTER_NOTES, loadNotes, saveNotes } = notes;
  assert.equal(NOTES_KEY, 'ubuntu-sean-notes-v1');
  const fresh = storage();
  const text = loadNotes(fresh), bytes = Buffer.from(text, 'utf8');
  assert.equal(bytes.length, 525);
  assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), blob);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '8cfade6f56f8046d1a2deae329e43d3f024095917d18dc11e436b095d9c9fb36');
  assert.equal(text.split('\n\n').length, 6);
  assert.ok(text.endsWith('Keep exploring: https://vectorindex.cloud'));
  assert.equal(fresh.writes.length, 0);
  for (const value of ['', 'My edited note', PREVIOUS_STARTER_NOTES + ' ', PREVIOUS_STARTER_NOTES.replace(/\n/g, '\r\n')]) {
    const state = storage([[NOTES_KEY, value], ['renamed-note', 'Keep']]);
    assert.equal(loadNotes(state), value);
    assert.equal(state.writes.length, 0);
    assert.equal(state.data.get('renamed-note'), 'Keep');
  }
  const old = storage([[NOTES_KEY, PREVIOUS_STARTER_NOTES]]);
  assert.equal(loadNotes(old), text);
  assert.equal(old.data.get(NOTES_KEY), text);
  assert.equal(old.data.get(WELCOME_VERSION_KEY), WELCOME_VERSION);
  old.writes.length = 0;
  assert.equal(loadNotes(old), text);
  assert.equal(old.writes.length, 0);
  saveNotes(old, PREVIOUS_STARTER_NOTES);
  assert.equal(loadNotes(old), PREVIOUS_STARTER_NOTES);
  old.data.delete(NOTES_KEY);
  old.writes.length = 0;
  assert.equal(loadNotes(old), '');
  assert.equal(old.writes.length, 0);
  for (const blockedKey of [WELCOME_VERSION_KEY, NOTES_KEY]) {
    const state = storage([[NOTES_KEY, PREVIOUS_STARTER_NOTES]]);
    const setItem = state.setItem;
    state.setItem = (key, value) => { if (key === blockedKey) throw Error('Blocked'); setItem(key, value); };
    assert.equal(loadNotes(state), PREVIOUS_STARTER_NOTES);
    assert.equal(state.data.get(NOTES_KEY), PREVIOUS_STARTER_NOTES);
  }
  for (const changed of ['Intervening user edit', '', null]) {
    const state = storage([[NOTES_KEY, PREVIOUS_STARTER_NOTES]]);
    const setItem = state.setItem;
    state.setItem = (key, value) => {
      setItem(key, value);
      if (key === WELCOME_VERSION_KEY) {
        if (changed === null) state.data.delete(NOTES_KEY);
        else state.data.set(NOTES_KEY, changed);
      }
    };
    assert.equal(loadNotes(state), changed === null ? '' : changed);
    assert.equal(state.getItem(NOTES_KEY), changed);
  }
  const info = JSON.parse(await read('build-info.json'));
  if (expectedCommit) assert.equal(info.commit, expectedCommit);
  console.log(JSON.stringify({ target, commit: info.commit, appChunk: resource, notesModule: id, welcomeBlob: blob, utf8Bytes: bytes.length, paragraphs: 6, exactDefault: 'passed', persistedNoteSafety: 'passed', verification: 'noninteractive compiled-module/HTTP; no browser or UI', checkedAt: new Date().toISOString() }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });

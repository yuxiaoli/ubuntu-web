const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { findLegacyMatches } = require('../scripts/scan-legacy-welcome.cjs');

function fingerprint(text, label = 'synthetic-marker') {
  return { label, characters: text.length, sha256: createHash('sha256').update(text).digest('hex') };
}

test('the scanner detects a synthetic protected phrase without storing its plaintext in results', () => {
  const phrase = 'Synthetic paragraph for a negative-content test.';
  const matches = findLegacyMatches('prefix ' + phrase + ' suffix', [fingerprint(phrase)]);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].label, 'synthetic-marker');
  assert.equal(JSON.stringify(matches).includes(phrase), false);
});

test('the scanner catches JavaScript Unicode, hex and punctuation escapes', () => {
  const phrase = "Synthetic 'quoted' text\nwith a line break.";
  const escaped = [...phrase].map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')).join('');
  const matches = findLegacyMatches('const value="' + escaped + '";', [fingerprint(phrase)]);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].representation, 'decoded');
});

test('the scanner decodes hex, code-point, quote, line-continuation and nested string escapes', () => {
  const { decodeJsEscapes } = require('../scripts/scan-legacy-welcome.cjs');
  const samples = [
    { phrase: 'Synthetic sample', encoded: '\\x53ynthetic sample' },
    { phrase: 'Synthetic sample', encoded: '\\u{53}ynthetic sample' },
    { phrase: "Synthetic 'sample'", encoded: "Synthetic \\'sample\\'" },
    { phrase: 'Synthetic "sample"', encoded: 'Synthetic \\"sample\\"' },
    { phrase: 'Synthetic sample\nnext', encoded: 'Synthetic sample\\nnext' },
    { phrase: 'Synthetic sample', encoded: 'Syn\\\nthetic sample' },
  ];
  for (const sample of samples) {
    assert.equal(findLegacyMatches(sample.encoded, [fingerprint(sample.phrase)]).length, 1);
    assert.equal(findLegacyMatches(JSON.stringify(sample.encoded), [fingerprint(sample.phrase)]).length, 1);
  }
  assert.equal(decodeJsEscapes('\\u{110000}'), '\\u{110000}');
});

test('near misses and harmless content do not match synthetic or opaque production signatures', () => {
  const phrase = 'A synthetic unique paragraph.';
  assert.deepEqual(findLegacyMatches('A synthetic unique paragraph!', [fingerprint(phrase)]), []);
  assert.deepEqual(findLegacyMatches('ordinary harmless content '.repeat(10)), []);
  assert.throws(() => findLegacyMatches('anything', [{ label: 'bad', characters: 0, sha256: 'a'.repeat(64) }]), /Invalid fingerprint/);
});

async function fixtureDirectory(t) {
  const fs = require('node:fs/promises');
  const path = require('node:path');
  const os = require('node:os');
  const base = path.resolve(os.tmpdir());
  assert.equal(/^[gh]:/i.test(base), false, 'use internal temporary storage');
  const directory = await fs.mkdtemp(path.join(base, 'ubuntu-legacy-scan-'));
  t.after(async () => {
    const resolved = path.resolve(directory);
    assert.ok(resolved.startsWith(base + path.sep));
    assert.ok(path.basename(resolved).startsWith('ubuntu-legacy-scan-'));
    await fs.rm(resolved, { recursive: true, force: true });
  });
  return { fs, path, directory };
}

test('artifact scanning includes nested text assets and verifies corresponding served bytes', async t => {
  const { scanArtifact } = require('../scripts/scan-legacy-welcome.cjs');
  const { fs, path, directory } = await fixtureDirectory(t);
  await fs.mkdir(path.join(directory, 'nested'));
  const assets = new Map([
    ['index.html', Buffer.from('<html>Harmless index</html>')],
    ['nested/app file.js', Buffer.from('const value = "Harmless";')],
    ['nested/data.json', Buffer.from('{"value":"Harmless"}')],
    ['nested/icon.svg', Buffer.from('<svg>Harmless icon</svg>')],
  ]);
  for (const [name, bytes] of assets) await fs.writeFile(path.join(directory, name), bytes);
  await fs.writeFile(path.join(directory, 'binary.png'), Buffer.from([0, 1, 2, 3]));
  const seen = [];
  const summary = await scanArtifact(directory, 'https://example.test/project/', {
    fingerprints: [fingerprint('Never included synthetic phrase')],
    fetchImpl: async url => {
      seen.push(url.href);
      const relative = decodeURIComponent(url.pathname.slice('/project/'.length));
      const bytes = assets.get(relative);
      assert.ok(bytes);
      return { status: 200, arrayBuffer: async () => Uint8Array.from(bytes).buffer };
    },
  });
  assert.equal(summary.localTextAssets, 4);
  assert.equal(summary.remoteTextAssets, 4);
  assert.equal(summary.localBytes, [...assets.values()].reduce((total, bytes) => total + bytes.length, 0));
  assert.equal(summary.remoteBytes, summary.localBytes);
  assert.equal(summary.legacyFingerprintMatches, 0);
  assert.equal(summary.servedBytesMatchArtifact, true);
  assert.equal(seen.length, 4);
  assert.ok(seen.some(url => url.includes('app%20file.js')));
});

test('artifact and served mismatch failures never echo protected or response text', async t => {
  const { scanArtifact } = require('../scripts/scan-legacy-welcome.cjs');
  const { fs, path, directory } = await fixtureDirectory(t);
  const phrase = 'Protected synthetic paragraph only.';
  await fs.writeFile(path.join(directory, 'index.html'), phrase);
  await assert.rejects(scanArtifact(directory, undefined, { fingerprints: [fingerprint(phrase)] }), error => {
    assert.match(error.message, /Legacy fingerprint detected/);
    assert.equal(error.message.includes(phrase), false);
    return true;
  });
  await fs.writeFile(path.join(directory, 'index.html'), 'Harmless HTML');
  await assert.rejects(scanArtifact(directory, 'https://example.test/', {
    fingerprints: [fingerprint(phrase)],
    fetchImpl: async () => ({ status: 200, arrayBuffer: async () => Uint8Array.from(Buffer.from(phrase)).buffer }),
  }), error => {
    assert.match(error.message, /Served asset verification failed/);
    assert.equal(error.message.includes(phrase), false);
    return true;
  });
  await assert.rejects(scanArtifact(directory, 'http://example.test/', { fingerprints: [] }), /must use HTTPS/);
});
